import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import axios from 'axios';
import sharp from 'sharp';
import { SlidePayload } from '../server';

const FONTS = {
  "Inter": {
    regular: "https://cdn.jsdelivr.net/npm/@fontsource/inter/files/inter-latin-400-normal.woff",
    bold: "https://cdn.jsdelivr.net/npm/@fontsource/inter/files/inter-latin-800-normal.woff"
  },
  "Playfair Display": {
    regular: "https://cdn.jsdelivr.net/npm/@fontsource/playfair-display/files/playfair-display-latin-400-normal.woff",
    bold: "https://cdn.jsdelivr.net/npm/@fontsource/playfair-display/files/playfair-display-latin-800-normal.woff"
  },
  "Lora": {
    regular: "https://cdn.jsdelivr.net/npm/@fontsource/lora/files/lora-latin-400-normal.woff",
    bold: "https://cdn.jsdelivr.net/npm/@fontsource/lora/files/lora-latin-700-normal.woff"
  },
  "Montserrat": {
    regular: "https://cdn.jsdelivr.net/npm/@fontsource/montserrat/files/montserrat-latin-400-normal.woff",
    bold: "https://cdn.jsdelivr.net/npm/@fontsource/montserrat/files/montserrat-latin-800-normal.woff"
  },
  "Bebas Neue": {
    regular: "https://cdn.jsdelivr.net/npm/@fontsource/bebas-neue/files/bebas-neue-latin-400-normal.woff",
    bold: "https://cdn.jsdelivr.net/npm/@fontsource/bebas-neue/files/bebas-neue-latin-400-normal.woff"
  },
  "Poppins": {
    regular: "https://cdn.jsdelivr.net/npm/@fontsource/poppins/files/poppins-latin-400-normal.woff",
    bold: "https://cdn.jsdelivr.net/npm/@fontsource/poppins/files/poppins-latin-800-normal.woff"
  },
  "Anton": {
    regular: "https://cdn.jsdelivr.net/npm/@fontsource/anton/files/anton-latin-400-normal.woff",
    bold: "https://cdn.jsdelivr.net/npm/@fontsource/anton/files/anton-latin-400-normal.woff"
  },
  "Oswald": {
    regular: "https://cdn.jsdelivr.net/npm/@fontsource/oswald/files/oswald-latin-400-normal.woff",
    bold: "https://cdn.jsdelivr.net/npm/@fontsource/oswald/files/oswald-latin-700-normal.woff"
  },
  "Roboto": {
    regular: "https://cdn.jsdelivr.net/npm/@fontsource/roboto/files/roboto-latin-400-normal.woff",
    bold: "https://cdn.jsdelivr.net/npm/@fontsource/roboto/files/roboto-latin-700-normal.woff"
  },
  "Open Sans": {
    regular: "https://cdn.jsdelivr.net/npm/@fontsource/open-sans/files/open-sans-latin-400-normal.woff",
    bold: "https://cdn.jsdelivr.net/npm/@fontsource/open-sans/files/open-sans-latin-800-normal.woff"
  },
  "Lato": {
    regular: "https://cdn.jsdelivr.net/npm/@fontsource/lato/files/lato-latin-400-normal.woff",
    bold: "https://cdn.jsdelivr.net/npm/@fontsource/lato/files/lato-latin-700-normal.woff"
  },
  "Amatic SC": {
    regular: "https://cdn.jsdelivr.net/npm/@fontsource/amatic-sc/files/amatic-sc-latin-400-normal.woff",
    bold: "https://cdn.jsdelivr.net/npm/@fontsource/amatic-sc/files/amatic-sc-latin-700-normal.woff"
  },
  "Caveat": {
    regular: "https://cdn.jsdelivr.net/npm/@fontsource/caveat/files/caveat-latin-400-normal.woff",
    bold: "https://cdn.jsdelivr.net/npm/@fontsource/caveat/files/caveat-latin-700-normal.woff"
  },
  "Cormorant Garamond": {
    regular: "https://cdn.jsdelivr.net/npm/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-400-normal.woff",
    bold: "https://cdn.jsdelivr.net/npm/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-700-normal.woff"
  },
  "Kalam": {
    regular: "https://cdn.jsdelivr.net/npm/@fontsource/kalam/files/kalam-latin-400-normal.woff",
    bold: "https://cdn.jsdelivr.net/npm/@fontsource/kalam/files/kalam-latin-700-normal.woff"
  }
};
const fontCaches: Record<string, { regular: Buffer, bold: Buffer }> = {};

async function getFontBuffers(family: string): Promise<{ regular: Buffer, bold: Buffer }> {
  if (fontCaches[family]) return fontCaches[family];
  const urls = FONTS[family as keyof typeof FONTS] || FONTS["Inter"];
  try {
    const [resReg, resBold] = await Promise.all([
      axios.get(urls.regular, { responseType: 'arraybuffer' }),
      axios.get(urls.bold, { responseType: 'arraybuffer' })
    ]);
    fontCaches[family] = { regular: Buffer.from(resReg.data), bold: Buffer.from(resBold.data) };
    return fontCaches[family];
  } catch (error: any) {
    if (family !== "Inter") return getFontBuffers("Inter");
    throw new Error(`Failed to load font files: ${error.message}`);
  }
}

export function parseHighlightedText(text: string): { text: string; isHighlight: boolean }[] {
  if (!text) return [];
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.filter(part => part !== '').map(part => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return { text: part.slice(2, -2), isHighlight: true };
    }
    return { text: part, isHighlight: false };
  });
}

export async function generateSlide(payload: SlidePayload): Promise<Buffer> {
  let backgroundImageBuffer: Buffer;
  let bgBase64: string;

  try {
    const response = await axios.get(payload.backgroundImageUrl, { responseType: 'arraybuffer' });
    let rawBuffer = Buffer.from(response.data);
    let mimeType = response.headers['content-type'] || 'image/jpeg';

    if (payload.theme.imageFilter && payload.theme.imageFilter !== "none") {
      let imageObj = sharp(rawBuffer);
      switch(payload.theme.imageFilter) {
        case "grayscale":
          imageObj = imageObj.grayscale();
          break;
        case "sepia":
          imageObj = imageObj.recomb([
             [0.393, 0.769, 0.189],
             [0.349, 0.686, 0.168],
             [0.272, 0.534, 0.131]
          ]);
          break;
        case "vintage":
          imageObj = imageObj.grayscale().tint({ r: 112, g: 66, b: 20 });
          break;
        case "dark-moody":
          imageObj = imageObj.modulate({ brightness: 0.7, saturation: 0.6 }).linear(1.1, -(0.05 * 255));
          break;
        case "duotone":
          imageObj = imageObj.grayscale().tint({ r: 50, g: 20, b: 100 });
          break;
        case "ethereal":
          imageObj = imageObj.modulate({ brightness: 1.15, saturation: 0.8 }).blur(1.5).linear(0.8, 10);
          break;
        case "matte":
          imageObj = imageObj.linear(0.8, 30).modulate({ saturation: 0.7 });
          break;
      }
      rawBuffer = await imageObj.toFormat('png').toBuffer();
      mimeType = 'image/png';
    } else {
      try {
        rawBuffer = await sharp(rawBuffer).toFormat('png').toBuffer();
        mimeType = 'image/png';
      } catch (e) {
        mimeType = 'image/png';
      }
    }
    
    backgroundImageBuffer = rawBuffer;
    bgBase64 = `data:${mimeType};base64,${backgroundImageBuffer.toString('base64')}`;
  } catch (error: any) {
    throw new Error(`Failed to load or process background image: ${error.message}`);
  }

  const headlineFontFamily = payload.theme.headlineFont || "Montserrat";
  const bodyFontFamily = payload.theme.bodyFont || "Inter";

  const [headlineFonts, bodyFonts] = await Promise.all([
    getFontBuffers(headlineFontFamily),
    getFontBuffers(bodyFontFamily)
  ]);
  
  let avatarBase64: string | undefined;
  if (payload.branding?.avatarUrl) {
    try {
      const response = await axios.get(payload.branding.avatarUrl, { responseType: 'arraybuffer' });
      let mimeType = response.headers['content-type'] || 'image/jpeg';
      let avatarBuffer = Buffer.from(response.data);
      try {
        avatarBuffer = await sharp(avatarBuffer).toFormat('png').toBuffer();
        mimeType = 'image/png';
      } catch (e) {}
      avatarBase64 = `data:${mimeType};base64,${avatarBuffer.toString('base64')}`;
    } catch (error) {
      console.warn(`Failed to load avatar from URL: ${payload.branding.avatarUrl}`);
    }
  }

  const width = 1080;
  const height = 1350;

  // Auto-fit Logic
  const headlineLen = payload.content.headline.length;
  let computedHeadlineFontSize = payload.slideCategory === 'hook' ? 80 : 56;
  if (payload.slideCategory === 'hook') {
    if (headlineLen > 70) computedHeadlineFontSize = 50;
    else if (headlineLen > 50) computedHeadlineFontSize = 60;
    else if (headlineLen > 30) computedHeadlineFontSize = 70;
  } else {
    if (headlineLen > 60) computedHeadlineFontSize = 40;
    else if (headlineLen > 40) computedHeadlineFontSize = 48;
  }

  let finalBgBase64 = bgBase64;
  if (payload.layout.imageFrame === 'soft-arch') {
    const svgSoftArch = `<svg width="960" height="1040" viewBox="0 0 960 1040" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="softBlur"><feGaussianBlur stdDeviation="25" /></filter>
        <mask id="softArchMask"><path d="M 40 480 A 440 440 0 0 1 920 480 L 920 1000 L 40 1000 Z" fill="white" filter="url(#softBlur)"/></mask>
      </defs>
      <image href="${bgBase64}" width="960" height="1040" preserveAspectRatio="xMidYMid slice" mask="url(#softArchMask)" />
    </svg>`;
    finalBgBase64 = 'data:image/svg+xml;base64,' + Buffer.from(svgSoftArch).toString('base64');
  }

  // Use flat Satori objects, representing the DOM tree.
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          width: 1080,
          height: 1350,
          position: 'relative',
          backgroundColor: payload.layout.imageFrame !== 'full' ? (payload.theme.textColor.toUpperCase() === '#FFFFFF' || payload.theme.textColor.toUpperCase() === '#FFF' ? '#111111' : '#FFFFFF') : 'transparent'
        },
        children: [
          {
            type: 'img',
            props: {
              src: finalBgBase64,
              style: payload.layout.imageFrame === 'full' ? {
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              } : {
                position: 'relative',
                alignSelf: 'center',
                marginTop: payload.layout.imageFrame === 'soft-arch' ? '40px' : '80px',
                width: payload.layout.imageFrame === 'soft-arch' ? '960px' : '880px',
                height: payload.layout.imageFrame === 'soft-arch' ? '1040px' : (payload.layout.imageFrame === 'arch' ? '960px' : '880px'),
                borderRadius: payload.layout.imageFrame === 'circle' ? '50%' : payload.layout.imageFrame === 'arch' ? '440px 440px 0 0' : payload.layout.imageFrame === 'soft-arch' ? '0' : '32px',
                objectFit: 'cover'
              }
            }
          },
          (payload.overlay?.enabled) ? {
            type: payload.overlay.type === 'film-grain' ? 'img' : 'div',
            props: payload.overlay.type === 'film-grain' ? {
              src: 'data:image/svg+xml;base64,' + Buffer.from('<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#n)" opacity="0.4"/></svg>').toString('base64'),
              style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: payload.overlay.opacity, objectFit: 'cover' }
            } : {
              style: (payload.overlay.type === 'blur-box' || payload.overlay.type === 'white-blur-box') ? { display: 'none' } : payload.overlay.type === 'bottom-gradient' ? {
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                width: '100%',
                height: payload.overlay.height || '75%',
                display: 'flex',
                backgroundImage: `linear-gradient(to top, rgba(0,0,0,${1 * payload.overlay.opacity}) 0%, rgba(0,0,0,${0.95 * payload.overlay.opacity}) 20%, rgba(0,0,0,${0.7 * payload.overlay.opacity}) 45%, rgba(0,0,0,0) 100%)`
              } : payload.overlay.type === 'white-bottom-gradient' ? {
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                width: '100%',
                height: payload.overlay.height || '75%',
                display: 'flex',
                backgroundImage: `linear-gradient(to top, rgba(255,255,255,${1 * payload.overlay.opacity}) 0%, rgba(255,255,255,${0.95 * payload.overlay.opacity}) 20%, rgba(255,255,255,${0.7 * payload.overlay.opacity}) 45%, rgba(255,255,255,0) 100%)`
              } : payload.overlay.type === 'top-gradient' ? {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                width: '100%',
                height: payload.overlay.height || '75%',
                display: 'flex',
                backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,${1 * payload.overlay.opacity}) 0%, rgba(0,0,0,${0.95 * payload.overlay.opacity}) 20%, rgba(0,0,0,${0.7 * payload.overlay.opacity}) 45%, rgba(0,0,0,0) 100%)`
              } : {
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                height: '100%',
                backgroundColor: `rgba(0, 0, 0, ${payload.overlay.opacity})`
              }
            }
          } : null,
          (payload.pagination?.current) ? {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: 60,
                right: 60,
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: '32px',
                fontWeight: 600,
                fontFamily: 'Inter'
              },
              children: payload.pagination.total ? `${payload.pagination.current}/${payload.pagination.total}` : `${payload.pagination.current}`
            }
          } : null,
          (payload.actionIndicator) ? {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                bottom: 60,
                right: 60,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: payload.overlay.type === 'white-blur-box' ? `rgba(255,255,255,0.6)` : payload.overlay.type === 'blur-box' ? `rgba(0,0,0,0.6)` : 'rgba(0,0,0,0.3)',
                padding: '12px 24px',
                borderRadius: '32px'
              },
              children: [
                {
                  type: 'div',
                  props: {
                     style: { color: payload.theme.textColor, fontSize: '24px', fontWeight: 600, fontFamily: bodyFontFamily },
                     children: payload.actionIndicator.type === 'swipe-arrow' ? '→' : (payload.actionIndicator.type === 'swipe-text' ? 'Deslize →' : 'Salvar post ⚑')
                  }
                }
              ]
            }
          } : null,
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                justifyContent: payload.layout.anchor === 'top' ? 'flex-start' : (payload.layout.anchor === 'center' ? 'center' : 'flex-end'),
                flexGrow: 1,
                backgroundColor: payload.overlay.type === 'blur-box' ? `rgba(0, 0, 0, ${payload.overlay.opacity})` : payload.overlay.type === 'white-blur-box' ? `rgba(255, 255, 255, ${payload.overlay.opacity})` : 'transparent',
                borderRadius: '0',
                margin: '0',
                paddingTop: payload.layout.anchor === 'top' || payload.overlay.type === 'blur-box' || payload.overlay.type === 'white-blur-box' ? 80 : 0,
                paddingBottom: payload.layout.anchor === 'bottom' || payload.overlay.type === 'blur-box' || payload.overlay.type === 'white-blur-box' ? 60 : 0,
                paddingLeft: 60,
                paddingRight: 60,
                color: payload.theme.textColor,
                fontFamily: bodyFontFamily,
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      justifyContent: payload.layout.textAlign === 'center' ? 'center' : (payload.layout.textAlign === 'right' ? 'flex-end' : 'flex-start'),
                      width: '100%',
                      maxWidth: '85%',
                      wordBreak: 'keep-all',
                      overflowWrap: 'break-word',
                    },
                    children: parseHighlightedText(payload.content.headline).map(frag => ({
                      type: 'div',
                      props: {
                        style: {
                          fontSize: computedHeadlineFontSize + 'px',
                          fontWeight: 800,
                          fontFamily: headlineFontFamily,
                          color: frag.isHighlight && payload.theme.highlightStyle === 'color' ? payload.theme.highlightColor : (frag.isHighlight && payload.theme.highlightStyle === 'box' ? '#111111' : payload.theme.textColor),
                          ...(payload.theme.textShadow ? { textShadow: (payload.theme.textColor.toUpperCase() === '#FFFFFF' || payload.theme.textColor.toUpperCase() === '#FFF' ? '0px 4px 20px rgba(0,0,0,0.8)' : '0px 4px 20px rgba(255,255,255,0.4)') } : {}),
                          ...(payload.theme.textOutline ? { WebkitTextStroke: (payload.theme.textColor.toUpperCase() === '#FFFFFF' || payload.theme.textColor.toUpperCase() === '#FFF' ? '2px black' : '2px white') } : {}),
                          backgroundColor: frag.isHighlight && payload.theme.highlightStyle === 'box' ? payload.theme.highlightColor : 'transparent',
                          textDecoration: frag.isHighlight && payload.theme.highlightStyle === 'underline' ? 'underline' : 'none',
                          textDecorationColor: frag.isHighlight && payload.theme.highlightStyle === 'underline' ? payload.theme.highlightColor : 'transparent',
                          padding: frag.isHighlight && payload.theme.highlightStyle === 'box' ? '0 16px' : '0',
                          borderRadius: frag.isHighlight && payload.theme.highlightStyle === 'box' ? '12px' : '0',
                          lineHeight: 1.1,
                          whiteSpace: 'pre-wrap', 
                        },
                        children: frag.text
                      }
                    }))
                  }
                },
                payload.content.subHeadline ? {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      justifyContent: payload.layout.textAlign === 'center' ? 'center' : (payload.layout.textAlign === 'right' ? 'flex-end' : 'flex-start'),
                      width: '100%',
                      marginTop: '24px',
                      maxWidth: '85%',
                      wordBreak: 'keep-all',
                      overflowWrap: 'break-word',
                    },
                    children: parseHighlightedText(payload.content.subHeadline).map(frag => ({
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '32px',
                          fontWeight: 400,
                          color: frag.isHighlight ? payload.theme.highlightColor : payload.theme.textColor,
                          opacity: frag.isHighlight ? 1 : 0.85,
                          ...(payload.theme.textShadow ? { textShadow: (payload.theme.textColor.toUpperCase() === '#FFFFFF' || payload.theme.textColor.toUpperCase() === '#FFF' ? '0px 4px 20px rgba(0,0,0,0.8)' : '0px 4px 20px rgba(255,255,255,0.4)') } : {}),
                          ...(payload.theme.textOutline ? { WebkitTextStroke: (payload.theme.textColor.toUpperCase() === '#FFFFFF' || payload.theme.textColor.toUpperCase() === '#FFF' ? '1px black' : '1px white') } : {}),
                          lineHeight: 1.4,
                          whiteSpace: 'pre-wrap', 
                        },
                        children: frag.text
                      }
                    }))
                  }
                } : null,
                (payload.slideCategory === 'body' && payload.content.bullets) ? {
                  type: 'div',
                  props: {
                    style: { display: 'flex', flexDirection: 'column', marginTop: '32px' },
                    children: payload.content.bullets.map(bullet => ({
                      type: 'div',
                      props: {
                        style: { display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: '24px' },
                        children: [
                          { type: 'div', props: { style: { width: '16px', height: '16px', borderRadius: '8px', backgroundColor: payload.theme.highlightColor, marginRight: '24px' } } },
                          { type: 'div', props: { style: { fontSize: '32px', color: payload.theme.textColor, lineHeight: 1.4 }, children: bullet } }
                        ]
                      }
                    }))
                  }
                } : null,
                (payload.branding?.handle || avatarBase64) ? {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: payload.layout.textAlign === 'center' ? 'center' : (payload.layout.textAlign === 'right' ? 'flex-end' : 'flex-start'),
                      marginTop: '48px',
                    },
                    children: [
                      avatarBase64 ? {
                        type: 'img',
                        props: {
                          src: avatarBase64,
                          style: {
                            width: '48px',
                            height: '48px',
                            borderRadius: '24px',
                            marginRight: '16px',
                            objectFit: 'cover'
                          }
                        }
                      } : null,
                      payload.branding?.handle ? {
                        type: 'div',
                        props: {
                          style: {
                            color: '#FFFFFF',
                            fontSize: '24px',
                            fontWeight: 600,
                            letterSpacing: '1px'
                          },
                          children: payload.branding.handle
                        }
                      } : null
                    ]
                  }
                } : null
              ]
            }
          }
        ]
      }
    },
    {
      width,
      height,
      fonts: [
        {
          name: headlineFontFamily,
          data: headlineFonts.regular,
          weight: 400,
          style: 'normal',
        },
        {
          name: headlineFontFamily,
          data: headlineFonts.bold,
          weight: 800,
          style: 'normal',
        },
        {
          name: bodyFontFamily,
          data: bodyFonts.regular,
          weight: 400,
          style: 'normal',
        },
        {
          name: bodyFontFamily,
          data: bodyFonts.bold,
          weight: 800,
          style: 'normal',
        }
      ],
    }
  );

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'original' },
  });
  
  const pngData = resvg.render();
  return pngData.asPng();
}
