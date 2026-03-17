"use client";

import { ReactNode } from "react";
import { ServerStyleSheet, StyleSheetManager } from "styled-components";
import { useServerInsertedHTML } from "next/navigation";

export default function StyledComponentsRegistry({ children } : { children : ReactNode }) {
  const sheet = new ServerStyleSheet();

  useServerInsertedHTML(() => {
    const styles = sheet.getStyleElement();
    (sheet.instance as any).clearTag();
    return <>{styles}</>;
  });

  return <StyleSheetManager sheet={sheet.instance}>{children}</StyleSheetManager>;
}