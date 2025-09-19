import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  Suspense,
} from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useLottieOptimization } from '../hooks/useLottieOptimization';
import { ErrorBoundary } from 'react-error-boundary';

const LottiePlayer = React.lazy(() => import('react-lottie-player'));

interface LottieOverlayProps {
  item: {
    id: number;
    image_url: string;
    item_type?: string;
    upgrade_level?: number;
    profile_position_x?: number | null;
    profile_position_y?: number | null;
    [key: string]: any;
  };
  index?: number;
  onPositionUpdate?: (
    itemId: number,
    newPosition: { x: number; y: number }
  ) => void;
  isEditMode?: boolean;
  onEditModeActivate?: () => void;
}

const LottieOverlay: React.FC<LottieOverlayProps> = React.memo(
  ({ item, index = 0, onPositionUpdate, isEditMode, onEditModeActivate }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [lottieData, setLottieData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [isVisible] = useState(true);
    const [isReversing, setIsReversing] = useState(false);

    const [position, setPosition] = useState({ x: 50, y: 50 });
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const containerRef = useRef<HTMLDivElement>(null);
    const lottieRef = useRef<any>(null);

    const handleAnimationComplete = useCallback(() => {
      if (!isReversing) {
        setIsReversing(true);
      } else {
        setIsReversing(false);
      }
    }, [isReversing]);

    const { performanceMode } = useLottieOptimization({
      lottieRef,
      isVisible,
      isDragging,
      reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)')
        .matches,
    });

    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 600);
      };

      checkMobile();
      window.addEventListener('resize', checkMobile);

      return () => {
        window.removeEventListener('resize', checkMobile);
      };
    }, []);

    useEffect(() => {
      const loadLottieData = async () => {
        if (!item?.image_url) {
          setHasError(true);
          setIsLoading(false);
          return;
        }

        const isJsonFile =
          item.item_type?.toLowerCase() === 'json' ||
          item.image_url.toLowerCase().endsWith('.json');

        if (!isJsonFile) {
          setHasError(true);
          setIsLoading(false);
          return;
        }

        try {
          setIsLoading(true);
          setHasError(false);

          const lottieUrl = item.image_url.replace('https://k-connect.ru', '');
          console.log('🎨 Loading Lottie from:', lottieUrl);

          let data;
          try {
            const response = await fetch(lottieUrl);
            console.log(
              '🎨 Response status:',
              response.status,
              response.statusText
            );

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            data = await response.json();
          } catch (fetchError) {
            console.log('🎨 Fetch failed, trying axios:', fetchError);

            const axios = (await import('axios')).default;
            const response = await axios.get(lottieUrl);
            data = response.data;
          }

          console.log('🎨 Lottie data loaded:', data);

          if (!data || typeof data !== 'object') {
            throw new Error('Invalid response: not a JSON object');
          }

          if (typeof data === 'string' && data.includes('<!DOCTYPE html>')) {
            throw new Error(
              'Server returned HTML instead of JSON - file not found'
            );
          }

          if (!data.assets || !Array.isArray(data.assets)) {
            throw new Error(
              'Invalid Lottie data structure: missing or invalid assets array'
            );
          }

          setLottieData(data);

          setIsReversing(false);
        } catch (error) {
          console.error('🎨 Ошибка загрузки Lottie анимации:', error);
          setHasError(true);
          setLottieData(null);
        } finally {
          setIsLoading(false);
        }
      };

      loadLottieData();
    }, [item?.image_url, item?.item_type]);

    const handleMouseDown = useCallback(
      (e: React.MouseEvent) => {
        if (!isEditMode) return;

        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);

        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          setDragStart({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          });
        }
      },
      [isEditMode]
    );

    const handleTouchStart = useCallback(
      (e: React.TouchEvent) => {
        if (!isEditMode) return;

        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);

        const rect = containerRef.current?.getBoundingClientRect();
        if (rect && e.touches[0]) {
          const touch = e.touches[0];
          setDragStart({
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top,
          });
        }
      },
      [isEditMode]
    );

    const lastUpdateTime = useRef(0);
    const THROTTLE_DELAY = 16;

    const handleMouseMove = useCallback(
      (e: MouseEvent) => {
        if (!isDragging || !isEditMode) return;

        const now = Date.now();
        if (now - lastUpdateTime.current < THROTTLE_DELAY) return;
        lastUpdateTime.current = now;

        e.preventDefault();
        e.stopPropagation();

        const avatarContainer = containerRef.current?.closest(
          '[data-avatar-container]'
        ) as HTMLElement;
        if (!avatarContainer) return;

        const avatarRect = avatarContainer.getBoundingClientRect();

        const newX = ((e.clientX - avatarRect.left) / avatarRect.width) * 100;
        const newY = ((e.clientY - avatarRect.top) / avatarRect.height) * 100;

        const clampedX = Math.max(-5, Math.min(105, newX));
        const clampedY = Math.max(-5, Math.min(105, newY));

        const newPosition = { x: clampedX, y: clampedY };
        setPosition(newPosition);

        if (onPositionUpdate) {
          onPositionUpdate(item.id, newPosition);
        }
      },
      [isDragging, isEditMode, onPositionUpdate, item.id]
    );

    const handleTouchMove = useCallback(
      (e: TouchEvent) => {
        if (!isDragging || !isEditMode) return;

        const now = Date.now();
        if (now - lastUpdateTime.current < THROTTLE_DELAY) return;
        lastUpdateTime.current = now;

        e.preventDefault();
        e.stopPropagation();

        const avatarContainer = containerRef.current?.closest(
          '[data-avatar-container]'
        ) as HTMLElement;
        if (!avatarContainer) return;

        const avatarRect = avatarContainer.getBoundingClientRect();

        const touch = e.touches[0];
        const newX =
          ((touch.clientX - avatarRect.left) / avatarRect.width) * 100;
        const newY =
          ((touch.clientY - avatarRect.top) / avatarRect.height) * 100;

        const clampedX = Math.max(-5, Math.min(105, newX));
        const clampedY = Math.max(-5, Math.min(105, newY));

        const newPosition = { x: clampedX, y: clampedY };
        setPosition(newPosition);

        if (onPositionUpdate) {
          onPositionUpdate(item.id, newPosition);
        }
      },
      [isDragging, isEditMode, onPositionUpdate, item.id]
    );

    const handleMouseUp = useCallback(() => {
      setIsDragging(false);
    }, []);

    const handleTouchEnd = useCallback(() => {
      setIsDragging(false);
    }, []);

    useEffect(() => {
      if (isEditMode) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('touchmove', handleTouchMove, {
          passive: false,
        });
        document.addEventListener('touchend', handleTouchEnd);

        return () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
          document.removeEventListener('touchmove', handleTouchMove);
          document.removeEventListener('touchend', handleTouchEnd);
        };
      }
    }, [
      isEditMode,
      handleMouseMove,
      handleMouseUp,
      handleTouchMove,
      handleTouchEnd,
    ]);

    if (!item) {
      return null;
    }

    const isLevel2 = item.upgrade_level === 2;
    const isLevel3 = item.upgrade_level === 3;

    if (!isLevel2 && !isLevel3) {
      return null;
    }

    const getItemSize = () => {
      if (isLevel3) {
        return isMobile ? '140px' : '150px';
      } else {
        return isMobile ? '170px' : '180px';
      }
    };

    const containerStyle = useMemo(
      () =>
        ({
          position: 'absolute' as const,
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: isDragging
            ? 'translate(-50%, -50%) scale(1.1)'
            : 'translate(-50%, -50%)',
          width: getItemSize(),
          height: getItemSize(),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: isEditMode ? 'grab' : 'pointer',
          zIndex: 12 - index,
          userSelect: 'none' as const,
          WebkitUserSelect: 'none' as any,
          MozUserSelect: 'none' as any,
          msUserSelect: 'none' as any,
          pointerEvents: 'auto' as const,
          touchAction: 'none',
          WebkitTouchCallout: 'none' as any,
          WebkitTapHighlightColor: 'transparent',
          ...(isDragging && {
            cursor: 'grabbing',
          }),
        }) as React.CSSProperties,
      [
        position.x,
        position.y,
        isDragging,
        isEditMode,
        index,
        isLevel2,
        isLevel3,
        isMobile,
      ]
    );

    if (isLoading) {
      return (
        <div ref={containerRef} style={containerStyle}>
          <CircularProgress size={24} />
        </div>
      );
    }

    if (hasError || !lottieData) {
      return null;
    }

    return (
      <div
        ref={containerRef}
        style={containerStyle}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onDragStart={(e: React.DragEvent) => e.preventDefault()}
        onMouseEnter={(e: React.MouseEvent) => e.preventDefault()}
        onMouseLeave={(e: React.MouseEvent) => e.preventDefault()}
        onFocus={(e: React.FocusEvent) => e.preventDefault()}
        onBlur={(e: React.FocusEvent) => e.preventDefault()}
        tabIndex={-1}
      >
        <Suspense fallback={<CircularProgress size={24} />}>
          {lottieData &&
          lottieData.assets &&
          Array.isArray(lottieData.assets) ? (
            <ErrorBoundary
              fallback={
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'text.secondary',
                    fontSize: '12px',
                  }}
                >
                  Ошибка анимации
                </Box>
              }
            >
              <LottiePlayer
                ref={lottieRef}
                loop={false}
                play={true}
                speed={
                  performanceMode === 'low'
                    ? 0.5
                    : performanceMode === 'medium'
                      ? 0.8
                      : 1
                }
                direction={isReversing ? -1 : 1}
                onComplete={handleAnimationComplete}
                style={{
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                }}
                animationData={lottieData}
                rendererSettings={{
                  preserveAspectRatio: 'xMidYMid slice',
                  progressiveLoad: true,
                  hideOnTransparent: true,

                  ...(performanceMode === 'low' && {
                    renderer: 'svg',
                  }),
                  ...(performanceMode === 'medium' && {
                    renderer: 'canvas',
                  }),
                  ...(performanceMode === 'high' && {
                    renderer: 'svg',
                  }),
                }}
              />
            </ErrorBoundary>
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.secondary',
                fontSize: '12px',
              }}
            >
              {isLoading
                ? 'Загрузка...'
                : hasError
                  ? 'Ошибка загрузки'
                  : 'Нет данных'}
            </Box>
          )}
        </Suspense>
      </div>
    );
  }
);

const areEqual = (prevProps: any, nextProps: any) => {
  const keysToCheck = [
    'id',
    'image_url',
    'profile_position_x',
    'profile_position_y',
    'upgrade_level',
  ];

  const prev = prevProps.item;
  const next = nextProps.item;

  const itemEqual = keysToCheck.every(k => prev[k] === next[k]);

  return itemEqual && prevProps.isEditMode === nextProps.isEditMode;
};

export default React.memo(LottieOverlay, areEqual);
