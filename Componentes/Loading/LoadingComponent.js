import loading from "../../img/loading.svg";
import styles from "./Loading.module.css";
import React from "react";

function Loading() {
  return (
    <div className={styles.loader_container}>
      <img className={styles.loader} src={loading} alt="Loading" />
    </div>
  );
}

export default Loading;
