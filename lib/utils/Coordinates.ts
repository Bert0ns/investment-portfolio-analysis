import * as THREE from 'three';
import countryCoordsData from '@/public/static/countries_coordinates.json';
import countryAliasesData from '@/public/static/country_aliases.json';

export const BASE_COORDINATES = countryCoordsData as unknown as Record<string, [number, number]>;
export const ALIASES = countryAliasesData as Record<string, string>;

export function getCoordinates(lat: number, lng: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}
