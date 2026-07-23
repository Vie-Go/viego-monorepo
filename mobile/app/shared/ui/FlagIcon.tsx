import React from 'react';
import { Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

export interface FlagIconProps {
  /** Country / language code e.g. 'vi', 'en', 'ko', 'ja', 'fr', 'VN', 'US', etc. */
  code: string;
  size?: number;
  testID?: string;
}

// SVG country flags (1x1 square format)
const FLAG_XML_MAP: Record<string, string> = {
  vi: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#da251d" d="M0 0h512v512H0z"/><path fill="#ff0" d="M256 95l37.6 115.8h121.8l-98.5 71.6 37.6 115.8-98.5-71.6-98.5 71.6 37.6-115.8-98.5-71.6h121.8z"/></svg>`,
  en: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#bd3d44" d="M0 0h512v512H0z"/><path stroke="#fff" stroke-width="39.3" d="M0 59.1h512M0 137.8h512M0 216.6h512M0 295.4h512M0 374.2h512M0 452.9h512"/><path fill="#192f5d" d="M0 0h256v275.7H0z"/><g fill="#fff"><polygon points="40,25 45,40 60,40 48,50 52,65 40,55 28,65 32,50 20,40 35,40"/><polygon points="120,25 125,40 140,40 128,50 132,65 120,55 108,65 112,50 100,40 115,40"/><polygon points="200,25 205,40 220,40 208,50 212,65 200,55 188,65 192,50 180,40 195,40"/><polygon points="80,75 85,90 100,90 88,100 92,115 80,105 68,115 72,100 60,90 75,90"/><polygon points="160,75 165,90 180,90 168,100 172,115 160,105 148,115 152,100 140,90 155,90"/><polygon points="40,125 45,140 60,140 48,150 52,165 40,155 28,165 32,150 20,140 35,140"/><polygon points="120,125 125,140 140,140 128,150 132,165 120,155 108,165 112,150 100,140 115,140"/><polygon points="200,125 205,240 220,240 208,250 212,265 200,255 188,265 192,250 180,240 195,240"/><polygon points="80,175 85,190 100,190 88,200 92,215 80,205 68,215 72,200 60,190 75,190"/><polygon points="160,175 165,190 180,190 168,200 172,215 160,205 148,215 152,200 140,190 155,190"/><polygon points="40,225 45,240 60,240 48,250 52,265 40,255 28,265 32,250 20,240 35,240"/><polygon points="120,225 125,240 140,240 128,250 132,265 120,255 108,265 112,250 100,240 115,240"/><polygon points="200,225 205,240 220,240 208,250 212,265 200,255 188,265 192,250 180,240 195,240"/></g></svg>`,
  ko: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#fff" d="M0 0h512v512H0z"/><circle cx="256" cy="256" r="128" fill="#cd2e3a"/><path fill="#0047a0" d="M256 128a128 128 0 0 0 0 256 64 64 0 0 0 0-128 64 64 0 0 1 0-128z"/><circle cx="256" cy="192" r="64" fill="#cd2e3a"/><g stroke="#000" stroke-width="12"><line x1="120" y1="120" x2="170" y2="170"/><line x1="135" y1="105" x2="185" y2="155"/><line x1="105" y1="135" x2="155" y2="185"/><line x1="342" y1="342" x2="392" y2="392"/><line x1="327" y1="357" x2="377" y2="407"/><line x1="357" y1="327" x2="407" y2="377"/></g></svg>`,
  ja: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#fff" d="M0 0h512v512H0z"/><circle cx="256" cy="256" r="150" fill="#bc002d"/></svg>`,
  fr: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#fff" d="M0 0h512v512H0z"/><path fill="#000091" d="M0 0h170.7v512H0z"/><path fill="#e1000f" d="M341.3 0H512v512H341.3z"/></svg>`,
};

FLAG_XML_MAP.VI = FLAG_XML_MAP.vi;
FLAG_XML_MAP.VN = FLAG_XML_MAP.vi;
FLAG_XML_MAP.vn = FLAG_XML_MAP.vi;

FLAG_XML_MAP.EN = FLAG_XML_MAP.en;
FLAG_XML_MAP.US = FLAG_XML_MAP.en;
FLAG_XML_MAP.us = FLAG_XML_MAP.en;

FLAG_XML_MAP.KO = FLAG_XML_MAP.ko;
FLAG_XML_MAP.KR = FLAG_XML_MAP.ko;
FLAG_XML_MAP.kr = FLAG_XML_MAP.ko;

FLAG_XML_MAP.JA = FLAG_XML_MAP.ja;
FLAG_XML_MAP.JP = FLAG_XML_MAP.ja;
FLAG_XML_MAP.jp = FLAG_XML_MAP.ja;

FLAG_XML_MAP.FR = FLAG_XML_MAP.fr;

export function FlagIcon({ code, size = 38, testID }: FlagIconProps) {
  const flagXml = FLAG_XML_MAP[code.toLowerCase()] || FLAG_XML_MAP[code];

  if (!flagXml) {
    return (
      <View
        testID={testID}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        className="items-center justify-center bg-surface"
      >
        <Text className="text-[12px] font-urbanist-heavy text-sub">{code}</Text>
      </View>
    );
  }

  return (
    <View
      testID={testID}
      style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden' }}
      className="items-center justify-center border border-black/5 dark:border-white/10"
    >
      <SvgXml xml={flagXml} width={size} height={size} />
    </View>
  );
}
