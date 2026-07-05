import { Helmet } from 'react-helmet-async';
import { CLINIC_NAME } from '../lib/constants';

const SEO = ({ title, description, keywords }) => {
  const pageTitle = title ? `${title} | ${CLINIC_NAME}` : `${CLINIC_NAME} | Trusted Healthcare for Every Family`;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      <meta property="og:title" content={pageTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content="website" />
    </Helmet>
  );
};

export default SEO;
