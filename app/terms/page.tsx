import { getTermsDetail } from '@/app/_libs/microcms';
import { TERMS_LIST_LIMIT } from '../_constants/index';
import styles from './page.module.css';

export default async function Page() {
  const data = await getTermsDetail({ limit: TERMS_LIST_LIMIT });

  return (
    <div className={styles.container}>
      {data.contents.length === 0 ? (
        <p className={styles.empty}>登録されていません。</p>
      ) : (
        <div className={styles.termsWrapper}>
          {data.contents.map((item) => (
            <div className={styles.termsContainer} key={item.id}>
              <h2>{item.terms}</h2>
              <p>
                当方は通信販売を行っておりませんが、Stripe社の決済システムを利用するにあたり、
                「割賦販売法」に基づき、以下の情報を開示いたします。
              </p>

              <table className={styles.termsTable}>
                <tbody>
                  <tr>
                    <th>販売業者の名称</th>
                    <td>蛯澤 大哉（Ebisawa Daiya）</td>
                  </tr>
                  <tr>
                    <th>所在地</th>
                    <td>請求があった場合には、遅滞なく開示いたします。</td>
                  </tr>
                  <tr>
                    <th>運営統括責任者</th>
                    <td>蛯澤 大哉</td>
                  </tr>
                  <tr>
                    <th>追加手数料等の追加料金</th>
                    <td>決済手数料が発生する場合は、事前に別途明示します。</td>
                  </tr>
                  <tr>
                    <th>交換および返品（返金ポリシー）</th>
                    <td>
                      通信販売に該当しないため、通常の返品・交換は受け付けておりません。<br />
                      決済処理や入力情報の誤りに関するお問い合わせは、個別に対応いたしますのでご連絡ください。
                    </td>
                  </tr>
                  <tr>
                    <th>サービス提供時期</th>
                    <td>各プロジェクトまたは提供内容ごとに異なります。詳細は個別にご案内いたします。</td>
                  </tr>
                  <tr>
                    <th>受け付け可能な決済手段</th>
                    <td>クレジットカード決済（Stripe対応のブランド）</td>
                  </tr>
                  <tr>
                    <th>決済期間</th>
                    <td>クレジットカード決済は即時処理されます。</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
