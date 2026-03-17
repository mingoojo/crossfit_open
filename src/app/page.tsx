import CsrWrapper from "@/assets/components/CsrWrapper/CsrWrapper";
import styles from "./home.module.css";
import PrivateRouter from "@/assets/components/PrivateRouter";

export default function Home() {

  return (
    <div
      className={styles.wrapper}
    >
      <h1>mainPage</h1>

      <div>
        서버 사이드 렌더링 되는곳
      </div>

      <div>
        클라이언트 사이드 렌더링 되는곳
        <PrivateRouter
          component={
            <CsrWrapper>
              <div>
            test
              </div>
            </CsrWrapper>
          }/>
      </div>
    </div>
  )
}
