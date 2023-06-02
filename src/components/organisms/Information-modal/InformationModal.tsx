import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { classNames } from "@/utils/functions";
import Icon from "@/components/atoms/icon/Icon";
export interface IModal {
  title?: string;
  subtitle?: string;
  isCentered?: boolean;
  icon?: string;
  type?: string;
  close?: () => void;
  containerClass?: string;
}

const InformationModal: React.FC<IModal> = ({
  containerClass,
  isCentered = true,
  close = () => null,
  title,
  type,
  icon,
}) => {
  return (
    <Transition appear show as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={close}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-auto">
          <div
            className={classNames(
              "flex items-center min-h-screen mx-auto",
              containerClass ?? "max-w-lg"
            )}
          >
            <div className="w-full flex justify-center items-center p-2 sm:p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  className={classNames(
                    "relative transform w-full overflow-hidden rounded-[20px] bg-white p-8 pt-12 align-middle shadow-xl transition-all flex flex-col gap-16 justify-end",
                    isCentered && "text-center"
                  )}
                >
                  <div
                    className={`-mx-8 -mt-12 p-8 pt-12 ${
                      type === "warning" ? "bg-orange-100" : "bg-green-100"
                    }`}
                  >
                    <div className="absolute -top-px right-0 pt-4 pr-[22px]">
                      <button
                        type="button"
                        className="rounded-md text-neutral-30 hover:text-gray-500 focus:outline-none focus:ring-offset-2"
                        onClick={close}
                      >
                        <span className="sr-only">Close</span>
                        <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                    {/* <div className="mx-auto flex items-center justify-center rounded-full mt-10 mb-3"></div> */}
                    <Dialog.Title as="h3" className="flex gap-3 items-center">
                      <Icon
                        icon={icon ?? "check"}
                        className={`w-12 flex-shrink-0 ${
                          type === "warning"
                            ? "text-orange-400"
                            : "text-green-400"
                        }`}
                      />
                      {title && (
                        <p
                          className={
                            type === "warning"
                              ? "text-orange-600"
                              : "text-green-600"
                          }
                        >
                          {title}
                        </p>
                      )}
                    </Dialog.Title>
                  </div>
                  <div className="flex justify-center gap-4 item">
                    <div
                      className={`cursor-pointer flex gap-1 items-center flex-nowrap w-fit button button-outline absolute bottom-[9%] right-12`}
                      onClick={close}
                    >
                      Cerrar
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default InformationModal;
