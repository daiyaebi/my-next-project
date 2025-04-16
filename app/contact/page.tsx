import styles from "./page.module.css";
import ContactForm from "../_components/ContactForm/index";

export default function Page(){
    return (
        <div className={styles.container}>
            <p className={styles.text}>
                ご質問、ごお仕事のご相談は下記フォームよりお問い合わせください。
                <br />
                内容確認後、ご連絡いたします。
            </p>
            <ContactForm />
        </div>
    );
}