"use client";
import Link from "next/link";
import { useLang } from "../lib/LangContext";

export function Footer() {
  const { lang } = useLang();
  const t = lang === "en"
    ? { about: "About", privacy: "Privacy", terms: "Terms", contact: "Contact", guide: "Guide" }
    : { about: "关于", privacy: "隐私政策", terms: "使用条款", contact: "联系", guide: "使用指南" };

  return (
    <footer>
      <div className="container">
        <div className="footer-links">
          <Link href="/about">{t.about}</Link>
          <Link href="/privacy">{t.privacy}</Link>
          <Link href="/terms">{t.terms}</Link>
          <Link href="/contact">{t.contact}</Link>
          <Link href="/guide">{t.guide}</Link>
          <a href="https://github.com/Alex92908/lottie-mini" target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
        <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 12 }}>
          © 2026 lottie-mini · MIT License · Alex Chu ·{" "}
          <a href="mailto:alex.chu0206@gmail.com" style={{ color: "var(--muted)" }}>alex.chu0206@gmail.com</a>
        </p>
      </div>
    </footer>
  );
}
