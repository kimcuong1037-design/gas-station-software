import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NotFound: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Result
      status="404"
      title="404"
      subTitle={t('common.pageNotFound')}
      extra={
        <Button type="primary" onClick={() => navigate('/')}>
          {t('common.backToHome')}
        </Button>
      }
    />
  );
};

export default NotFound;
