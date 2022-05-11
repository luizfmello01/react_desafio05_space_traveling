import { GetStaticProps } from 'next';
import Link from 'next/link';
import { getPrismicClient } from '../services/prismic';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { FiCalendar, FiUser } from 'react-icons/fi';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useEffect, useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextPage, setNextPage] = useState<String>(null);

  useEffect(() => {
    setPosts(postsPagination.results);
    setNextPage(postsPagination.next_page);
  }, []);

  const handleAddPosts = async () => {
    const response: PostPagination = await fetch(String(nextPage))
    .then(data => (data.json()))

    setPosts([...posts, ...response.results])
    setNextPage(response.next_page);
  }

  return (
    <main className={`${commonStyles.contentContainer}`}>
      <section className={styles.articleContainer}>
        { posts.map(post => {
          return (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <article className={styles.articleContent}>
                  <h1>{post.data.title}</h1>
                  <p>{post.data.subtitle}</p>
                  <footer>
                    <div className={styles.date}>
                      <FiCalendar width={20} height={20} />
                      <span>
                        { format(
                            new Date(post.first_publication_date), "dd MMM yyyy", 
                            {
                              locale: ptBR
                            }
                          ) }
                      </span>
                    </div>
                    <div className={styles.createdBy}>
                      <FiUser width={20} height={20} />
                      <span>{post.data.author}</span>
                    </div>
                  </footer>
                </article>
              </a>
            </Link>
          );
        }) }
      </section>
      
      { nextPage !== null && 
        <button
          className={styles.buttonLoadPosts}
          onClick={handleAddPosts}
        >
          Carregar mais posts
        </button>
      } 
    </main>
  );
}

const getPostsPrismic = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('articles');

  return postsResponse;
}

export const getStaticProps: GetStaticProps = async () => {
  const postsResponse = await getPostsPrismic();

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: postsResponse.results
      }
    },
    revalidate: 60 * 60 // 1 hour
  }
};
