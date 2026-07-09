import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use — lottie-mini",
  description:
    "Terms of use for the lottie-mini website and open-source project. Free to use, MIT-licensed, no warranty. Read the full terms here.",
  alternates: { canonical: "https://lottie-mini.com/terms" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
