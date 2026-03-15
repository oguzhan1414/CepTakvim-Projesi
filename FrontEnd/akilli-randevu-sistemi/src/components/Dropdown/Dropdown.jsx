import React, { useState, useRef, useEffect } from 'react';
import Input from '../Inputs/Input';
import './Dropdown.css';

const Dropdown = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Seçiniz...',
  multiple = false,
  searchable = false,
  disabled = false,
  error,
  className = '',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Dışarı tıklandığında dropdown'ı kapat
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Seçili opsiyonu bul
  const getSelectedOption = () => {
    if (multiple) {
      return options.filter(opt => value?.includes(opt.value));
    }
    return options.find(opt => opt.value === value);
  };

  // Görünen metin
  const getDisplayText = () => {
    const selected = getSelectedOption();
    if (multiple) {
      if (selected?.length === 0) return placeholder;
      if (selected?.length === 1) return selected[0].label;
      return `${selected?.length} öğe seçildi`;
    }
    return selected ? selected.label : placeholder;
  };

  // Opsiyonları filtrele (searchable ise)
  const filteredOptions = searchable
    ? options.filter(opt => 
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Opsiyon seç
  const handleSelect = (option) => {
    if (option.disabled) return;

    if (multiple) {
      const newValue = value ? [...value] : [];
      const index = newValue.indexOf(option.value);
      
      if (index === -1) {
        newValue.push(option.value);
      } else {
        newValue.splice(index, 1);
      }
      
      onChange?.(newValue);
    } else {
      onChange?.(option.value);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  // Grupları render et
  const renderOptions = () => {
    let currentGroup = null;

    return filteredOptions.map((option, index) => {
      // Grup başlığı
      if (option.group && option.group !== currentGroup) {
        currentGroup = option.group;
        return (
          <React.Fragment key={`group-${option.group}`}>
            <div className="dropdown-group-header">{option.group}</div>
            {renderOption(option, index)}
          </React.Fragment>
        );
      }
      
      return renderOption(option, index);
    });
  };

  const renderOption = (option, index) => {
    const isSelected = multiple
      ? value?.includes(option.value)
      : value === option.value;

    return (
      <div
        key={`${option.value}-${index}`}
        className={`dropdown-option ${multiple ? 'multi' : ''} ${isSelected ? 'selected' : ''} ${option.disabled ? 'disabled' : ''}`}
        onClick={() => handleSelect(option)}
      >
        {option.icon && <span className="option-icon">{option.icon}</span>}
        {option.label}
      </div>
    );
  };

  return (
    <div className={`dropdown ${className}`} ref={dropdownRef} {...props}>
      {label && <span className="dropdown-label">{label}</span>}
      
      {/* Dropdown Tetikleyici */}
      <div
        className={`dropdown-trigger ${isOpen ? 'active' : ''} ${!getSelectedOption() ? 'placeholder' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span>{getDisplayText()}</span>
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>
          ▼
        </span>
      </div>

      {/* Dropdown Menü */}
      <div className={`dropdown-menu ${isOpen ? 'open' : ''}`}>
        {searchable && (
          <div className="dropdown-search">
            <input
              type="text"
              placeholder="Ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
        )}
        
        <div className="dropdown-options">
          {filteredOptions.length > 0 ? (
            renderOptions()
          ) : (
            <div className="dropdown-option disabled">Sonuç bulunamadı</div>
          )}
        </div>
      </div>

      {/* Hata mesajı */}
      {error && <span className="input-error">{error}</span>}
    </div>
  );
};

export default Dropdown;