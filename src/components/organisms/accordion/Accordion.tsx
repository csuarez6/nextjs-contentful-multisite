import React from 'react';
import { Disclosure } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { IAccordion } from '@/lib/interfaces/accordion-cf.interface';


function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

const Accordion: React.FC<IAccordion> = ({ listedContent }) => {
    return (
        <>
            {
                listedContent &&
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {listedContent?.map((el, i) => {
                        if (!el.title) return;
                        return (
                            <Disclosure as="div" key={i} className="border-t border-neutral-80" >
                                {({ open }) => (
                                    <div>
                                        <dt className="text-lg">
                                            <Disclosure.Button className={`flex w-full items-center justify-between pl-7 text-left text-gray-400 pt-[24px] ${!open ? 'md:mb-[55px] mb-7' : ''}`}>
                                                <h3 className="text-blue-dark text-size-subtitle1">{el.title}</h3>
                                                <span className="flex w-8 justify-center items-center h-full mr-2">
                                                    <ChevronDownIcon
                                                        className={classNames(open ? '-rotate-180' : 'rotate-0', 'flex w-8 h-auto transform text-neutral-30')}
                                                        aria-hidden="true"
                                                        width={10}
                                                        height={5}
                                                    />
                                                </span>
                                            </Disclosure.Button>
                                        </dt>
                                        <Disclosure.Panel as="dd" className="mt-2  pl-7 pr-12">
                                            <p className="text-base text-gray-500">{el.content}</p>
                                        </Disclosure.Panel>
                                    </div>
                                )}
                            </Disclosure>
                        );
                    })}
                </dl>
            }
        </>

    );
};

export default Accordion;