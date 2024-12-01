export interface PixelHistory {
  owner: string;
  price: number;
  timestamp: number;
}

export interface Pixel {
  x: number;
  y: number;
  owner: string | null;
  image: string | null;
  link: string | null;
  color: string | null;
  history: PixelHistory[];
  currentPrice: number;
}

export interface GridSelection {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface GridState {
  purchasedPixels: Record<string, Pixel>;
  selection: GridSelection | null;
}