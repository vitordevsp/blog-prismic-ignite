import Head from 'next/head';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { RichText } from 'prismic-dom';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import Header from '../components/Header';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

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
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  return (
    <>
      <Head>
        <title>Posts | Blog Prismic</title>
      </Head>

      <Header />

      <main className={styles.container}>
        {postsPagination.results.map(post => (
          <Link key={post.uid} href={`post/${post.uid}`}>
            <a className={styles.contentPost}>
              <h1 className={commonStyles.title}>{post.data.title}</h1>

              <h2 className={commonStyles.subtitle}>{post.data.subtitle}</h2>

              <div className={styles.containerInfo}>
                <div>
                  <FiCalendar />
                  <span className={commonStyles.info}>
                    {post.first_publication_date}
                  </span>
                </div>

                <div>
                  <FiUser />
                  <span className={commonStyles.info}>{post.data.author}</span>
                </div>
              </div>
            </a>
          </Link>
        ))}
      </main>

      <footer className={styles.footer}>
        <button type="button">Carregar mais posts</button>
      </footer>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query('', {
    fetch: ['post.title', 'post.subtitle', 'post.author'],
    pageSize: 10,
  });

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy',
        { locale: ptBR }
      ),
      data: {
        title: RichText.asText(post.data.title),
        subtitle: RichText.asText(post.data.subtitle),
        author: RichText.asText(post.data.author),
      },
    };
  });

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results,
      },
    },
  };
};
