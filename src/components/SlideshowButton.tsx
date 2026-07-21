import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MonitorPlay, Settings } from 'lucide-react';
import { SlideshowModal } from './SlideshowModal';
import { SlideshowSettingsModal, SlideshowConfig } from './SlideshowSettingsModal';

interface SlideshowButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
}

const DEFAULT_CONFIG: SlideshowConfig = {
  type: 'all',
  genreId: 'all',
  duration: 7,
};

export const SlideshowButton: React.FC<SlideshowButtonProps> = ({
  className = '',
  variant = 'default',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [config, setConfig] = useState<SlideshowConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    const saved = localStorage.getItem('slideshow_config');
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch(e) {}
    }
  }, []);

  const handleSaveConfig = (newConfig: SlideshowConfig) => {
    setConfig(newConfig);
    localStorage.setItem('slideshow_config', JSON.stringify(newConfig));
  };

  return (
    <>
      <div className={`flex items-stretch gap-[1px] rounded-md overflow-hidden ${className}`}>
        <Button
          variant={variant}
          className="flex-1 rounded-none flex items-center justify-center gap-2 font-medium transition-all duration-300 hover:scale-105"
          onClick={() => setIsModalOpen(true)}
        >
          <MonitorPlay className="w-5 h-5" />
          Slideshow
        </Button>
        <Button
          variant={variant}
          className="w-12 px-0 rounded-none border-l border-black/10 flex items-center justify-center transition-all duration-300 hover:bg-yellow-500 hover:text-black"
          onClick={() => setIsSettingsOpen(true)}
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      {isModalOpen && (
        <SlideshowModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          config={config}
        />
      )}

      {isSettingsOpen && (
        <SlideshowSettingsModal
          open={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
          config={config}
          onSave={handleSaveConfig}
        />
      )}
    </>
  );
};
