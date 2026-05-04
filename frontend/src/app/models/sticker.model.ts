export type StickerType = 'foil' | 'normal' | 'history' | 'special';
export type StickerSection = 'fwc' | 'team' | 'coca';

export interface Sticker {
  id: string;          // e.g. "FWC1", "MEX5", "CC1"
  name: string;
  section: StickerSection;
  teamCode?: string;   // e.g. "MEX", "ARG"
  teamName?: string;
  type: StickerType;
  albumOrder: number;  // for sorting
}

export interface Team {
  code: string;
  name: string;
  flag: string;
  group: string;
  stickers: Sticker[];
}

export interface UserCollection {
  username: string;
  owned: Record<string, boolean>;     // stickerId -> owned
  repeated: Record<string, number>;  // stickerId -> count of extras
  lastUpdated: string;
}
