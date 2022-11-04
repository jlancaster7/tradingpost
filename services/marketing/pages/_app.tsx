import '../styles/globals.css'
import Layout from '../components/Layout';

// @ts-ignore
export default function App({Component, pageProps}) {
    return (
        <Layout>
            <Component {...pageProps} />
        </Layout>
    )
}
