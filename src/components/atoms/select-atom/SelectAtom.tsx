import React, { Fragment, useState, forwardRef, DetailedHTMLProps, SelectHTMLAttributes } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import Icon from '../icon/Icon';
import { classNames } from '@/utils/functions';

export interface IListContent {
  value: string;
  text: string;
}

export interface ISelect extends DetailedHTMLProps<SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement> {
  name?: string,
  listedContents: IListContent[],
  labelSelect?: string,
  placeholder?: string,
  handleChange?: (evt) => void,
}

const SelectAtom: React.FC<ISelect> = forwardRef((
  { name, listedContents, labelSelect, handleChange, placeholder = "Seleccionar", ...rest },
  ref
) => {
  const [selectedOption, setSelectedOption] = useState({ value: '', text: placeholder });
  if (listedContents.length === 0) return;
  const onChange = (evt) => {
    const input: HTMLSelectElement = document.querySelector(`select[name=${name}]`);
    input.value = evt.value;
    setSelectedOption(evt);
    handleChange(evt.value);
  };

  const onChangeInput = (evt) => {
    const { value } = evt.target;
    const currentOption = listedContents.find(el => el.value === value);
    setSelectedOption(currentOption);
    handleChange(value);
  };

  return (
    <>
      <select hidden name={name} ref={ref} {...rest} defaultValue={""} onChange={onChangeInput}>
        <option value="" disabled>{placeholder}</option>
        {listedContents?.map((content) => (<option key={content.value} value={content.value}>{content.text}</option>))}
      </select>

      <Listbox value={selectedOption} onChange={onChange}>
        {({ open }) => (
          <div className='flex flex-col gap-1'>
            {labelSelect && (
              <Listbox.Label className="text-lg leading-none text-grey-30 font-medium">{labelSelect}</Listbox.Label>
            )}
            <div className="grid gap-2 mt-1 relative">
              <Listbox.Button className={
                classNames(
                  "flex gap-[10px] flex-nowrap p-3 bg-white border border-grey-60 rounded hover:border-grey-30 group",
                  open && "border-lucuma-60"
                )}
              >
                <span className={classNames("grow text-left font-medium", selectedOption?.text ? "text-grey-30" : "text-grey-60")}>
                  {selectedOption?.text ?? placeholder}
                </span>
                <span className={
                  classNames(
                    'w-6 h-6 flex items-center text-grey-60 group-hover:text-grey-30',
                    open && "transform rotate-180"
                  )}
                >
                  <Icon icon='arrow-down' className='w-full h-full' />
                </span>
              </Listbox.Button>
              <Transition
                show={open}
                as={Fragment}
                leave="transition ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute z-20 min-w-full top-full mt-2">
                  <Listbox.Options className="flex flex-col border bg-white border-grey-80 rounded-md pt-1 pb-4">
                    {listedContents?.map((content) => (
                      <Listbox.Option
                        key={content.value}
                        value={content}
                        className={
                          classNames(
                            "p-[10px] text-size-p2 text-gray-700 cursor-pointer hover:bg-grey-90",
                            content.text === selectedOption.text ? "font-bold" : "font-medium"
                          )
                        }
                      >
                        {content.text}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </Transition>
            </div>
          </div>
        )}
      </Listbox>
    </>
  );
});

SelectAtom.displayName = 'SelectAtom';
export default SelectAtom;
