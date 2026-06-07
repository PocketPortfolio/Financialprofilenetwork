'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useDesktopNav } from '@/app/hooks/useDesktopNav';
import { useAuth } from '@/app/hooks/useAuth';
import { SupportFormModal } from '@/app/components/dashboard/SupportFormModal';
import {
  DASHBOARD_NAV_PRIMARY,
  DASHBOARD_NAV_SECTIONS,
  isDashboardNavItemActive,
  type DashboardNavItem,
  type DashboardNavSection,
} from '@/app/lib/nav/dashboardNavConfig';
import styles from './DesktopNav.module.css';

const SECTION_STATE_PREFIX = 'pp-desktop-nav-section-';

function readSectionOpen(sectionId: string, defaultOpen: boolean): boolean {
  if (typeof window === 'undefined') return defaultOpen;
  try {
    const stored = sessionStorage.getItem(`${SECTION_STATE_PREFIX}${sectionId}`);
    if (stored === 'true') return true;
    if (stored === 'false') return false;
  } catch {
    // ignore
  }
  return defaultOpen;
}

function writeSectionOpen(sectionId: string, open: boolean): void {
  try {
    sessionStorage.setItem(`${SECTION_STATE_PREFIX}${sectionId}`, open ? 'true' : 'false');
  } catch {
    // ignore
  }
}

function NavItemLink({
  item,
  pathname,
  onImport,
  onSupport,
  itemClassName,
  buttonClassName,
}: {
  item: DashboardNavItem;
  pathname: string;
  onImport: () => void;
  onSupport: () => void;
  itemClassName: string;
  buttonClassName: string;
}) {
  const active = isDashboardNavItemActive(item, pathname);
  const Icon = item.icon;

  if (item.action === 'import-modal') {
    return (
      <button type="button" onClick={onImport} className={buttonClassName}>
        <Icon className={styles.navIcon} strokeWidth={2} aria-hidden />
        {item.label}
      </button>
    );
  }

  if (item.action === 'support-modal') {
    return (
      <button type="button" onClick={onSupport} className={buttonClassName}>
        <Icon className={styles.navIcon} strokeWidth={2} aria-hidden />
        {item.label}
      </button>
    );
  }

  return (
    <Link
      href={item.href}
      className={`${itemClassName}${active ? ` ${styles.navItemActive}` : ''}`}
      aria-current={active ? 'page' : undefined}
    >
      <Icon className={styles.navIcon} strokeWidth={active ? 2.25 : 2} aria-hidden />
      {item.label}
    </Link>
  );
}

function NavSection({
  section,
  pathname,
  isAdmin,
  onImport,
  onSupport,
}: {
  section: DashboardNavSection;
  pathname: string;
  isAdmin: boolean;
  onImport: () => void;
  onSupport: () => void;
}) {
  const visibleItems = section.items.filter((item) => !item.adminOnly || isAdmin);
  if (visibleItems.length === 0) return null;
  if (section.adminOnly && !isAdmin) return null;

  const [open, setOpen] = useState(() => readSectionOpen(section.id, section.defaultOpen ?? false));

  const toggle = () => {
    setOpen((prev) => {
      const next = !prev;
      writeSectionOpen(section.id, next);
      return next;
    });
  };

  return (
    <div className={styles.section}>
      <button type="button" onClick={toggle} className={styles.sectionToggle} aria-expanded={open}>
        {section.label}
        <ChevronDown
          className={`${styles.sectionChevron}${open ? ` ${styles.sectionChevronOpen}` : ''}`}
          size={14}
          aria-hidden
        />
      </button>
      {open && (
        <div className={styles.sectionItems}>
          {visibleItems.map((item) => {
            const active = isDashboardNavItemActive(item, pathname);
            const className = item.action
              ? styles.sectionButton
              : `${styles.sectionItem}${active ? ` ${styles.sectionItemActive}` : ''}`;

            return (
              <NavItemLink
                key={item.id}
                item={item}
                pathname={pathname}
                onImport={onImport}
                onSupport={onSupport}
                itemClassName={className}
                buttonClassName={className}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function DesktopNav() {
  const { isOpen } = useDesktopNav();
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [tourExpandGeneration, setTourExpandGeneration] = useState(0);

  useEffect(() => {
    const onTourOpen = () => {
      for (const section of DASHBOARD_NAV_SECTIONS) {
        if (!section.adminOnly) {
          writeSectionOpen(section.id, true);
        }
      }
      setTourExpandGeneration((n) => n + 1);
    };
    window.addEventListener('pp-desktop-nav-tour-open', onTourOpen);
    return () => window.removeEventListener('pp-desktop-nav-tour-open', onTourOpen);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const checkAdmin = async () => {
      if (!user) {
        if (!cancelled) setIsAdmin(false);
        return;
      }
      try {
        const token = await user.getIdTokenResult();
        if (!cancelled) setIsAdmin(token.claims.admin === true);
      } catch {
        if (!cancelled) setIsAdmin(false);
      }
    };

    void checkAdmin();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleImport = useCallback(() => {
    try {
      sessionStorage.setItem('openImportModal', 'true');
    } catch {
      // ignore
    }
    if (pathname !== '/dashboard') {
      router.push('/dashboard');
    } else {
      window.dispatchEvent(new CustomEvent('openImportModal'));
    }
  }, [pathname, router]);

  return (
    <>
      <aside
        data-tour="desktop-nav-rail"
        aria-label="Desktop navigation"
        aria-hidden={!isOpen}
        className={`pp-desktop-nav-rail ${styles.rail} ${isOpen ? styles.railOpen : styles.railClosed}`}
      >
        <div className={styles.inner}>
          <nav className={styles.navScroll}>
            {DASHBOARD_NAV_PRIMARY.map((item) => {
              const active = isDashboardNavItemActive(item, pathname);
              return (
                <NavItemLink
                  key={item.id}
                  item={item}
                  pathname={pathname}
                  onImport={handleImport}
                  onSupport={() => setShowSupportModal(true)}
                  itemClassName={`${styles.navItem}${active ? ` ${styles.navItemActive}` : ''}`}
                  buttonClassName={styles.navButton}
                />
              );
            })}

            {DASHBOARD_NAV_SECTIONS.filter((section) => !section.adminOnly || isAdmin).map((section) => (
              <NavSection
                key={`${section.id}-${tourExpandGeneration}`}
                section={section}
                pathname={pathname}
                isAdmin={isAdmin}
                onImport={handleImport}
                onSupport={() => setShowSupportModal(true)}
              />
            ))}
          </nav>
        </div>
      </aside>

      <SupportFormModal
        open={showSupportModal}
        onClose={() => setShowSupportModal(false)}
        user={user ? { email: user.email, displayName: user.displayName } : null}
      />
    </>
  );
}
