import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ConfigProvider, Layout, Typography } from 'antd';
import { CrownOutlined } from '@ant-design/icons';

import { useTheme } from '@/hooks/useTheme';
import AppSidebar from '@/layouts/AppSidebar';
import './SponsorsPage.css';

function BecomeButton({ contact, block }: { contact?: string; block?: boolean }) {
  const { t } = useTranslation();
  if (!contact) return null;
  return (
    <Button
      type="primary"
      icon={<CrownOutlined aria-hidden />}
      href={contact}
      target="_blank"
      rel="noopener noreferrer"
      block={block}
    >
      {t('pages.sponsors.become')}
    </Button>
  );
}

export default function SponsorsPage() {
  const { t } = useTranslation();
  const { isDark, isUltra, antdThemeConfig } = useTheme();

  const pageClass = useMemo(() => {
    const classes = ['sponsors-page'];
    if (isDark) classes.push('is-dark');
    if (isUltra) classes.push('is-ultra');
    return classes.join(' ');
  }, [isDark, isUltra]);

  return (
    <ConfigProvider theme={antdThemeConfig}>
      <Layout className={pageClass}>
        <AppSidebar />
        <Layout className="content-shell">
          <Layout.Content className="content-area">
            <div className="sponsors-inner">
              <div className="sponsors-header">
                <div>
                  <Typography.Title level={3} className="sponsors-title">
                    <CrownOutlined aria-hidden className="sponsors-title-icon" />{' '}
                    {t('pages.sponsors.title')}
                  </Typography.Title>
                  <Typography.Text type="secondary">{t('pages.sponsors.intro')}</Typography.Text>
                </div>
                <BecomeButton contact="https://donate.sanaei.dev/" />
              </div>


            </div>
          </Layout.Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
