import { getTermsDetail } from '@/app/_libs/microcms';
import { TERMS_LIST_LIMIT } from '../_constants/index';
import styles from './page.module.css';

export default async function Page() {
  const data = await getTermsDetail({ limit: TERMS_LIST_LIMIT });

  const parseTerms = (termsText: string) => {
    const titleMatch = termsText.match(/^特定商取引法に基づく表記/);
    const leadMatch = termsText.match(/当方は通信販売.*?開示いたします。/);

    const title = titleMatch ? '特定商取引法に基づく表記' : '';
    const lead = leadMatch ? leadMatch[0] : '';

    // "項目： 内容" より後ろの情報を切り出す
    const body = termsText.replace(title, '').replace(lead, '').replace('項目： 内容', '').trim();

    // "・" または "販売業者の名称" などのキーワードで分割
    const sections = body
      .split(/・|販売業者の名称|所在地|電話番号|メールアドレス|運営統括責任者|追加手数料等の追加料金|交換および返品（返金ポリシー）|サービス提供時期|受け付け可能な決済手段|決済期間/)
      .map(s => s.trim())
      .filter(Boolean);

    const keys = [
      '販売業者の名称',
      '所在地',
      '電話番号',
      'メールアドレス',
      '運営統括責任者',
      '追加手数料等の追加料金',
      '交換および返品（返金ポリシー）',
      'サービス提供時期',
      '受け付け可能な決済手段',
      '決済期間'
    ];

    const parsedEntries = sections.map((content, i) => ({
      label: keys[i],
      value: content
    }));

    return { title, lead, entries: parsedEntries };
  };

  return (
    <div className={styles.container}>
      {data.contents.length === 0 ? (
        <p className={styles.empty}>登録されていません。</p>
      ) : (
        <div className={styles.termsWrapper}>
          {data.contents.map((item) => {
            const parsed = parseTerms(item.terms);
            return (
              <div key={item.id} className={styles.termsBlock}>
                <h2 className={styles.title}>{parsed.title}</h2>
                <p className={styles.lead}>{parsed.lead}</p>
                <table className={styles.termsTable}>
                  <tbody>
                    {parsed.entries.map((entry, i) => (
                      <tr key={i}>
                        <th>{entry.label}</th>
                        <td>{entry.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
