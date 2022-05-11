import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import PrismicDOM from 'prismic-dom';
import { useRouter } from 'next/router'

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter()
  
  if ( router.isFallback ) {
    return (
      <main className={commonStyles.contentContainer}>
        <h1>Carregando...</h1>
      </main>
    )
  }

  const clock = post.data.content.map(content => {
    try {
      const title = content.heading?.match(/\b(\w+)\b/g).length
      const text = PrismicDOM.RichText.asText(content.body).match(/\b(\w+)\b/g).length

      return title + text;
    } catch {
      return 0;
    }
  }).reduce( (total, lengthConteudo) => total += lengthConteudo ) / 200;

  return (
    <>
      { post.data.banner.url !== undefined && (
        <div 
          className={styles.imageContainer}
          style={{
            background: `url(${post.data.banner.url})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            width: '100%',
            height: '400px'
          }}
        >
        </div>
      ) }

      <main className={`${commonStyles.contentContainer} ${styles.mainContainer}`}>
        <h1 className={styles.title}>{post.data.title}</h1>
        <div className={styles.metaData}>
          <span className={styles.data}>
            <FiCalendar width={20} height={20} /> 
            {
              format(
                new Date(post.first_publication_date), "dd MMM yyyy", 
                {
                  locale: ptBR
                }
              )
            }
          </span>

          <span className={styles.data}>
            <FiUser width={20} height={20} />
            {post.data.author}
          </span>

          <span className={styles.data}>
            <FiClock width={20} height={20} />
            {Math.ceil(clock)} min
          </span>
        </div>

      
        { post.data.content.map(content => (
          <div key={content.heading} className={styles.articleContent}>
            <h1>{content.heading}</h1>

            { content.body.map(paragraph => (
              <p key={content.body.indexOf(paragraph)}>{paragraph.text}</p>
            )) }
          </div>
        )) }

        
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('articles');

  const paths = posts.results.map(result => (
    {params: { slug: result.uid }}
  ));

  return ({
    paths: paths,
    fallback: true
  });
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('articles', String(params.slug));

  return ({
    props: {
      post: response
    },
    revalidate: 60 * 60 // 1 hour
  });
};
