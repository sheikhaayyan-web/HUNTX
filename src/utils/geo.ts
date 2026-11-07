// ==============================================================================
// HUNTX GEOMETRY & DYNAMIC SHRINKING ZONE MATH
// ==============================================================================

import { LatLng, ZoneBoundary, ZoneStage } from '../types/huntx';

// Earth radius in meters
const EARTH_RADIUS = 6371000;

/**
 * Calculates Haversine distance between two coordinates in meters.
 */
export function calculateDistanceMeters(p1: LatLng, p2: LatLng): number {
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const lat1 = (p1.lat * Math.PI) / 180;
  const lat2 = (p2.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS * c;
}

/**
 * Checks if point is inside circular zone.
 */
export function isPointInCircle(point: LatLng, center: LatLng, radiusMeters: number): boolean {
  return calculateDistanceMeters(point, center) <= radiusMeters;
}

/**
 * Ray-casting algorithm to test whether a point is inside a polygon.
 */
export function isPointInPolygon(point: LatLng, polygon: LatLng[]): boolean {
  if (!polygon || polygon.length < 3) return false;

  let inside = false;
  const n = polygon.length;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;

    const intersect =
      yi > point.lat !== yj > point.lat &&
      point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Computes polygon centroid.
 */
export function calculatePolygonCentroid(polygon: LatLng[]): LatLng {
  if (!polygon || polygon.length === 0) return { lat: 0, lng: 0 };
  let sumLat = 0;
  let sumLng = 0;
  for (const pt of polygon) {
    sumLat += pt.lat;
    sumLng += pt.lng;
  }
  return {
    lat: sumLat / polygon.length,
    lng: sumLng / polygon.length,
  };
}

/**
 * Safely scales a polygon inwards towards its centroid by ratio (0 < scale <= 1.0).
 * Prevents polygon inversion and self-intersection.
 */
export function shrinkPolygonTowardsCentroid(polygon: LatLng[], scaleRatio: number): LatLng[] {
  if (!polygon || polygon.length < 3) return polygon;
  const centroid = calculatePolygonCentroid(polygon);

  return polygon.map((pt) => ({
    lat: centroid.lat + (pt.lat - centroid.lat) * scaleRatio,
    lng: centroid.lng + (pt.lng - centroid.lng) * scaleRatio,
  }));
}

/**
 * Interpolates between two polygons coordinate by coordinate.
 */
export function interpolatePolygons(polyA: LatLng[], polyB: LatLng[], progress: number): LatLng[] {
  const t = Math.max(0, Math.min(1, progress));
  const count = Math.min(polyA.length, polyB.length);
  const result: LatLng[] = [];

  for (let i = 0; i < count; i++) {
    result.push({
      lat: polyA[i].lat + (polyB[i].lat - polyA[i].lat) * t,
      lng: polyA[i].lng + (polyB[i].lng - polyA[i].lng) * t,
    });
  }

  return result;
}

export interface DynamicZoneState {
  currentRadiusMeters: number;
  currentPolygon?: LatLng[];
  isShrinkingNow: boolean;
  activeStageIndex: number;
  nextStageSecondsRemaining: number;
  currentStageShrinkProgress: number; // 0 to 1
  stageNotice: string;
}

/**
 * Computes the live active zone geometry based on elapsed match time and stages.
 */
export function evaluateDynamicZone(
  initialZone: ZoneBoundary,
  stages: ZoneStage[],
  elapsedSeconds: number
): DynamicZoneState {
  if (!stages || stages.length === 0) {
    return {
      currentRadiusMeters: initialZone.initial_radius_meters,
      currentPolygon: initialZone.initial_polygon,
      isShrinkingNow: false,
      activeStageIndex: -1,
      nextStageSecondsRemaining: 999999,
      currentStageShrinkProgress: 0,
      stageNotice: 'Zone Static',
    };
  }

  // Sorted by start_offset_seconds
  const sortedStages = [...stages].sort((a, b) => a.start_offset_seconds - b.start_offset_seconds);

  let currentRadius = initialZone.initial_radius_meters;
  let currentPoly = initialZone.initial_polygon;
  let isShrinking = false;
  let activeIndex = -1;
  let nextStageRemaining = 999999;
  let shrinkProgress = 0;
  let notice = 'Safe zone stable';

  // Trace through stages
  for (let i = 0; i < sortedStages.length; i++) {
    const stage = sortedStages[i];
    const prevRadius =
      i === 0
        ? initialZone.initial_radius_meters
        : sortedStages[i - 1].target_radius_meters ||
          initialZone.initial_radius_meters * Math.pow(0.7, i);

    const prevPoly =
      i === 0
        ? initialZone.initial_polygon
        : sortedStages[i - 1].target_polygon ||
          shrinkPolygonTowardsCentroid(initialZone.initial_polygon || [], Math.pow(0.7, i));

    const targetRadius =
      stage.target_radius_meters || prevRadius * stage.target_radius_ratio;

    const targetPoly =
      stage.target_polygon ||
      (prevPoly ? shrinkPolygonTowardsCentroid(prevPoly, stage.target_radius_ratio) : undefined);

    const stageStart = stage.start_offset_seconds;
    const stageEnd = stageStart + stage.shrink_duration_seconds;

    if (elapsedSeconds < stageStart) {
      // Game hasn't reached this stage yet
      nextStageRemaining = stageStart - elapsedSeconds;
      notice = `Shrink Stage ${stage.stage_number} in ${nextStageRemaining}s`;
      break;
    } else if (elapsedSeconds >= stageStart && elapsedSeconds <= stageEnd) {
      // In the middle of shrinking!
      isShrinking = true;
      activeIndex = i;
      shrinkProgress = (elapsedSeconds - stageStart) / stage.shrink_duration_seconds;
      currentRadius = prevRadius + (targetRadius - prevRadius) * shrinkProgress;

      if (prevPoly && targetPoly) {
        currentPoly = interpolatePolygons(prevPoly, targetPoly, shrinkProgress);
      }

      notice = `SHRINKING ACTIVE: Stage ${stage.stage_number} (${Math.round(shrinkProgress * 100)}%)`;
      nextStageRemaining = 0;
      break;
    } else {
      // Stage already completed, update baseline
      currentRadius = targetRadius;
      currentPoly = targetPoly;
      activeIndex = i;
      notice = `Stage ${stage.stage_number} Completed`;
    }
  }

  return {
    currentRadiusMeters: Math.round(currentRadius),
    currentPolygon: currentPoly,
    isShrinkingNow: isShrinking,
    activeStageIndex: activeIndex,
    nextStageSecondsRemaining: Math.max(0, nextStageRemaining),
    currentStageShrinkProgress: shrinkProgress,
    stageNotice: notice,
  };
}

/**
 * Checks if a player's location is inside the safe zone.
 */
export function isPlayerInsideZone(
  location: LatLng,
  zoneType: 'circle' | 'polygon',
  center: LatLng,
  currentRadiusMeters: number,
  currentPolygon?: LatLng[]
): boolean {
  if (zoneType === 'circle') {
    return isPointInCircle(location, center, currentRadiusMeters);
  } else if (zoneType === 'polygon' && currentPolygon && currentPolygon.length >= 3) {
    return isPointInPolygon(location, currentPolygon);
  }
  return true;
}
