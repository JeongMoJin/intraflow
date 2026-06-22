import { useLanguage } from '../hooks/useLanguage';
import type { Language } from '../hooks/useLanguage';

const options: Array<{ value: Language; label: string }> = [
  { value: 'ko', label: 'KO' },
  { value: 'en', label: 'EN' },
];

export function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="language-switch" aria-label="Language selector">
      {options.map((option, index) => (
        <span className="language-option" key={option.value}>
          <button
            className={language === option.value ? 'active' : ''}
            type="button"
            aria-pressed={language === option.value}
            onClick={() => setLanguage(option.value)}
          >
            {option.label}
          </button>
          {index === 0 ? <span className="language-divider">/</span> : null}
        </span>
      ))}
    </div>
  );
}
