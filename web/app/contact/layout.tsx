import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact — lottie-mini",
  description:
    "How to reach the maintainer of lottie-mini for bug reports, feature requests, partnership inquiries, or general feedback. Email and GitHub links included.",
  alternates: { canonical: "https://lottie-mini.com/contact" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
