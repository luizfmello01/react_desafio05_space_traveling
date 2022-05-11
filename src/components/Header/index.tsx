/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import Link from 'next/link';
import Image from 'next/image';

import commonStyles from '../../styles/common.module.scss';
import styles from './header.module.scss';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={commonStyles.contentContainer}>
        <Link href="/">
          <a>
            <Image src="/images/logo.svg" alt="logo" width="240" height="26" />
          </a>
        </Link>
      </div>
    </header>
  );
}
