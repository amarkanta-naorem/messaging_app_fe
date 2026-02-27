import { Metadata } from "next";

/**
 * Base configuration for the application
 */
export const APP_CONFIG = {
  name: "GlobiChat",
  description: "A modern messaging platform for seamless team communication",
  keywords: ["messaging", "chat", "team communication", "whatsapp clone", "business chat"],
  url: process.env.NEXT_PUBLIC_APP_URL || "https://globichat.app",
  locale: "en_US",
  siteName: "GlobiChat",
} as const;

/**
 * Get the base metadata for the application
 */
export function getBaseMetadata(): Metadata {
  return {
    metadataBase: new URL(APP_CONFIG.url),
    title: {
      default: APP_CONFIG.name,
      template: `%s | ${APP_CONFIG.name}`,
    },
    description: APP_CONFIG.description,
  keywords: [...APP_CONFIG.keywords],
    authors: [{ name: APP_CONFIG.name }],
    creator: APP_CONFIG.name,
    publisher: APP_CONFIG.name,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: APP_CONFIG.locale,
      url: APP_CONFIG.url,
      siteName: APP_CONFIG.siteName,
      title: APP_CONFIG.name,
      description: APP_CONFIG.description,
      images: [
        {
          url: "/image/chat-bg.jpg",
          width: 1200,
          height: 630,
          alt: APP_CONFIG.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: APP_CONFIG.name,
      description: APP_CONFIG.description,
      images: ["/image/chat-bg.jpg"],
      creator: "@globichat",
    },
    icons: {
      icon: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
    manifest: "/manifest.json",
  };
}

/**
 * Page-specific metadata configurations
 */
export const PAGE_METADATA = {
  home: {
    title: "Home",
    description: "Welcome to GlobiChat - Your modern messaging platform",
    keywords: ["messaging", "chat", "team communication", "whatsapp clone", "business chat"],
  },
  login: {
    title: "Login",
    description: "Sign in to your GlobiChat account to start messaging",
    keywords: ["login", "sign in", "authentication", "chat login"],
  },
  dashboard: {
    title: "Dashboard",
    description: "Manage your conversations and team members from your personalized dashboard",
    keywords: ["dashboard", "chat dashboard", "team management", "messaging dashboard"],
  },
  chat: {
    title: "Messages",
    description: "Your conversations and messages in one place",
    keywords: ["messages", "chat", "conversations", "messaging", "whatsapp"],
  },
  employees: {
    title: "Employees",
    description: "Manage your organization's employees and contacts",
    keywords: ["employees", "team members", "contacts", "organization management"],
  },
  organisations: {
    title: "Organisations",
    description: "Create and manage your organisations",
    keywords: ["organisations", "organizations", "teams", "business management"],
  },
} as const;

/**
 * Generate metadata for a specific page
 */
export function getPageMetadata(page: keyof typeof PAGE_METADATA): Metadata {
  const pageConfig = PAGE_METADATA[page];
  return {
    title: pageConfig.title,
    description: pageConfig.description,
    keywords: [...pageConfig.keywords],
    openGraph: {
      ...getBaseMetadata().openGraph,
      title: `${pageConfig.title} | ${APP_CONFIG.name}`,
      description: pageConfig.description,
    },
    twitter: {
      ...getBaseMetadata().twitter,
      title: `${pageConfig.title} | ${APP_CONFIG.name}`,
      description: pageConfig.description,
    },
  };
}
