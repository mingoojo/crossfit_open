"use client"

import React from "react"
import { ThemeProvider } from "styled-components"
import { Reset } from "styled-reset"

import GlobalStyle from "../../styles/GlobalStyle"
import { defaultTheme } from "../../styles/ThemeSet"
import { CookiesProvider } from "react-cookie"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000, // 기본 10초
      retry: 2, // 실패 시 1회 재시도
      refetchOnWindowFocus: false, // 포커스 시 자동 리패치 비활성화(선호에 따라)
    },
  },
});

export default function Providers({ children } : {children : React.ReactNode}) {

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={defaultTheme}>
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
        <Reset/>
        <GlobalStyle />
        <CookiesProvider>
          {children}
        </CookiesProvider>
      </ThemeProvider>
    </QueryClientProvider>

  )
}