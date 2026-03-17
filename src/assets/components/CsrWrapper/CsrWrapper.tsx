import Providers from "@/assets/components/CsrWrapper/Providers";
import StyledComponentsRegistry from "@/assets/components/CsrWrapper/StyledComponentsRegistry";
import { ReactNode } from "react";

export default function CsrWrapper({ children } : {children : ReactNode}) {
  return (
    <StyledComponentsRegistry>
      <Providers>
        {children}
      </Providers>
    </StyledComponentsRegistry>
  )
}