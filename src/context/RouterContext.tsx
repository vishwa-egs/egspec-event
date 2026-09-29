import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface RouterContextType {
  path: string;
  params: Record<string, string>;
  searchParams: URLSearchParams;
  navigate: (to: string, state?: unknown) => void;
  goBack: () => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export const RouterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [path, setPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });
  const [searchParams, setSearchParams] = useState<URLSearchParams>(() => {
    return new URLSearchParams(window.location.search);
  });

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname || '/');
      setSearchParams(new URLSearchParams(window.location.search));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string) => {
    const [pathname, search] = to.split('?');
    window.history.pushState({}, '', to);
    setPath(pathname || '/');
    setSearchParams(new URLSearchParams(search || ''));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    window.history.back();
  };

  // Extract dynamic parameters like /events/:id or /organizer/events/:id/edit
  const params: Record<string, string> = {};
  if (path.startsWith('/events/')) {
    const sub = path.replace('/events/', '');
    if (sub && !sub.includes('/')) {
      params.id = sub;
    }
  } else if (path.startsWith('/organizer/events/') && path.endsWith('/edit')) {
    const parts = path.split('/');
    if (parts[3]) {
      params.id = parts[3];
    }
  }

  return (
    <RouterContext.Provider value={{ path, params, searchParams, navigate, goBack }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = (): RouterContextType => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};

export const Link: React.FC<{
  to: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}> = ({ to, className, children, onClick }) => {
  const { navigate } = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    if (onClick) onClick();
    navigate(to);
  };

  return (
    <a href={to} className={className} onClick={handleClick}>
      {children}
    </a>
  );
};
