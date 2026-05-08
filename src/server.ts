import express, { Request, Response } from 'express';
import { z } from 'zod';
import { generateSlide } from './services/imageGenerator';

const app = express();
app.use(express.json());

const SlidePayloadSchema = z.object({
  backgroundImageUrl: z.string().url(),
  slideCategory: z.enum(["hook", "body", "cta"]).default("hook"),
  content: z.object({
    headline: z.string(),
    subHeadline: z.string().optional(),
    bullets: z.array(z.string()).max(4).optional()
  }),
  theme: z.object({
    textColor: z.string().regex(/^#[0-9A-Fa-f]{3,6}$/, "Must be a valid hex color").default("#FFFFFF"),
    highlightColor: z.string().regex(/^#[0-9A-Fa-f]{3,6}$/, "Must be a valid hex color").default("#E4AD75"),
    highlightStyle: z.enum(["color", "box", "underline"]).default("color"),
    imageFilter: z.enum(["none", "grayscale", "sepia", "vintage", "dark-moody", "duotone", "ethereal", "matte"]).default("none"),
    headlineFont: z.enum(["Montserrat", "Bebas Neue", "Poppins", "Anton", "Oswald", "Playfair Display", "Inter", "Amatic SC", "Cormorant Garamond"]).default("Montserrat"),
    bodyFont: z.enum(["Roboto", "Inter", "Open Sans", "Lato", "Caveat", "Kalam"]).default("Inter"),
    textShadow: z.boolean().default(false),
    textOutline: z.boolean().default(false)
  }).default({ textColor: "#FFFFFF", highlightColor: "#E4AD75", highlightStyle: "color", imageFilter: "none", headlineFont: "Montserrat", bodyFont: "Inter", textShadow: false, textOutline: false }),
  layout: z.object({
    anchor: z.enum(["top", "center", "bottom"]).default("bottom"),
    textAlign: z.enum(["left", "center", "right"]).default("left"),
    imageFrame: z.enum(["full", "arch", "circle", "square", "soft-arch"]).default("full")
  }).default({ anchor: "bottom", textAlign: "left", imageFrame: "full" }),
  branding: z.object({
    avatarUrl: z.string().url().optional(),
    handle: z.string().optional()
  }).optional(),
  pagination: z.object({
    current: z.number().optional(),
    total: z.number().optional()
  }).optional(),
  overlay: z.object({
    enabled: z.boolean().default(false),
    type: z.enum(["bottom-gradient", "top-gradient", "full-dark", "blur-box", "white-bottom-gradient", "white-blur-box", "film-grain"]).default("bottom-gradient"),
    height: z.string().default("75%"),
    opacity: z.number().min(0).max(1).default(0.8)
  }).default({ enabled: false, type: "bottom-gradient", height: "75%", opacity: 0.8 }),
  actionIndicator: z.object({
    type: z.enum(["swipe-arrow", "swipe-text", "save-button"])
  }).optional()
});

export type SlidePayload = z.infer<typeof SlidePayloadSchema>;

app.post('/api/v1/generate-slide', async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = SlidePayloadSchema.parse(req.body);

    // Trava de Segurança de Contraste
    const isLightOverlay = payload.overlay.enabled && (payload.overlay.type === "white-bottom-gradient" || payload.overlay.type === "white-blur-box");
    if (payload.slideCategory === 'hook' || isLightOverlay) {
      payload.theme.textColor = "#1A1A1A";
    }

    const imageBuffer = await generateSlide(payload);
    
    res.setHeader('Content-Type', 'image/png');
    res.status(200).send(imageBuffer);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      console.error("Zod Validation Error:", JSON.stringify(error.errors, null, 2));
      res.status(400).json({ error: "Invalid payload details", details: error.errors });
      return;
    }
    console.error("Error generating slide:", error);
    res.status(400).json({ error: error.message || "Failed to generate image" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Carousel API is running on http://localhost:${PORT}`);
});
