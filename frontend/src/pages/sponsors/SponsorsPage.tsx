import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ConfigProvider, Layout, Typography } from 'antd';
import { CrownOutlined, HeartOutlined } from '@ant-design/icons';

import { useTheme } from '@/hooks/useTheme';
import AppSidebar from '@/layouts/AppSidebar';
import './SponsorsPage.css';

function BecomeButton({ contact, block }: { contact?: string; block?: boolean }) {
  const { t } = useTranslation();
  if (!contact) return null;
  return (
    <Button
      type="primary"
      icon={<HeartOutlined aria-hidden />}
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
              </div>
              <section className="sponsors-support" aria-labelledby="sponsors-support-title">
                <span className="sponsors-support-icon">
                  <HeartOutlined aria-hidden />
                </span>
                <span className="sponsors-support-eyebrow">3X-UI · OPEN SOURCE</span>
                <Typography.Title level={2} id="sponsors-support-title">
                  {t('pages.sponsors.supportTitle')}
                </Typography.Title>
                <Typography.Paragraph className="sponsors-support-text">
                  {t('pages.sponsors.supportText')}
                </Typography.Paragraph>
                <BecomeButton contact="https://donate.sanaei.dev/" />
                <Typography.Text type="secondary" className="sponsors-support-note">
                  {t('pages.sponsors.supportNote')}
                </Typography.Text>
              </section>
            </div>
          </Layout.Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
