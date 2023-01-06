import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { Disclosure } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

import { classNames } from "../../../utils/functions";
import { INavigation } from "@/lib/interfaces/menu-cf.interface";
import Icon from "@/components/atoms/icon/Icon";
import MegaMenu from "@/components/organisms/mega-menu/MegaMenu";
import { getUrlPath } from "@/utils/link.utils";

const HeaderBlock: React.FC<INavigation> = (props) => {
  const { asPath } = useRouter();

  // console.log(props)
  // console.log(JSON.stringify(props))
  const {
    promoImage,
    mainNavCollection,
    secondaryNavCollection,
    utilityNavCollection,
  } = props;
  const mainNavCollectionMenu = mainNavCollection.items.filter(
    (el) => el.slug === "home"
  )[0].mainNavCollection;

  return (
    <Disclosure as="header" id="header" className="sticky inset-x-0 top-0 z-20">
      {({ open }) => (
        <div className="mx-auto xl:container">
          <div className="px-2 sm:px-4 2xl:px-[70px]">
            {/* Top */}
            <div className="relative hidden lg:block">
              <div className="bg-neutral-90 min-w-[100vw] -mx-[50vw] absolute h-full inset-x-0"></div>
              <nav
                aria-label="Menú principal"
                className="relative flex justify-between gap-14 xl:gap-[76px] min-h-[42px] h-full"
              >
                <ul className="relative flex gap-6 flex-nowrap grow">
                  {mainNavCollection.items.map((item, index) => (
                    <li className="flex items-center" key={item.sys.id}>
                      <Link
                        className={classNames(
                          item.slug === asPath
                            ? "text-blue-dark border-lucuma"
                            : "text-neutral-30 border-transparent",
                          "hover:text-blue-dark pt-2 pb-3 text-xl font-semibold leading-none border-b-2"
                        )}
                        href={getUrlPath(item)}
                        aria-current={index === 0 ? "page" : undefined}
                      >
                        {item.promoTitle ?? item.name}
                      </Link>
                    </li>
                  ))}
                </ul>

                <ul className="relative flex gap-6 flex-nowrap">
                  {secondaryNavCollection.items.map((item, index) => (
                    <li className="flex items-center" key={item.sys.id}>
                      <Link
                        className={classNames(
                          item.slug === asPath
                            ? "text-blue-dark border-lucuma"
                            : "text-neutral-30 border-transparent",
                          "hover:text-blue-dark pt-2 pb-3 text-xl font-semibold leading-none border-b-2"
                        )}
                        href={getUrlPath(item)}
                        aria-current={index === 0 ? "page" : undefined}
                      >
                        {item.promoTitle ?? item.name}
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="bg-[#FF8E67] bg-opacity-30 justify-self-end flex items-center px-[10px] py-[5px]">
                  <p className="flex items-center gap-1 title is-5 text-blue-dark flex-nowrap">
                    <span className="w-8 h-8 shrink-0">
                      <Icon
                        icon="emergency"
                        className="w-full h-full mx-auto"
                      />
                    </span>
                    Emergencias: 164
                  </p>
                </div>
              </nav>
            </div>
            {/* Middle */}
            <div className="relative flex items-center min-h-[92px] justify-between gap-6">
              <div className="relative z-10 flex px-2 lg:px-0 lg:mt-[10px]">
                <Link href="/" className="flex items-center flex-shrink-0">
                  <figure className="relative h-[52px] aspect-[180/52]">
                    <Image
                      className="block w-auto"
                      src={promoImage?.url ?? "/images/vanti-logo.png"}
                      alt={promoImage?.description ?? "Grupo Vanti"}
                      fill
                    />
                  </figure>
                </Link>
              </div>

              <div className="flex items-center py-5 divide-x divide-neutral-70">
                <form action="#" method="post" className="h-10 max-w-xs pr-6">
                  <div className="bg-category-blue-light-90 text-[#868DA5] rounded-lg flex flex-nowrap gap-2 p-2 pl-3">
                    <label htmlFor="search" className="flex items-center">
                      <span className="flex items-center w-6 h-6 shrink-0">
                        <Icon icon="search" className="w-full h-full mx-auto" />
                      </span>
                    </label>
                    <input
                      id="search"
                      type="text"
                      placeholder="Buscar"
                      className="bg-transparent focus:outline-none text-[#616B8A] text-lg font-medium"
                      autoComplete="off"
                    />
                  </div>
                </form>
                {utilityNavCollection?.items && (
                  <nav
                    aria-label="Utility"
                    className="relative hidden px-6 lg:block"
                  >
                    <ul className="flex gap-1 flex-nowrap">
                      {utilityNavCollection.items.map((item) => (
                        <li className="flex max-w-[75px]" key={item.sys.id}>
                          <Link
                            className="bg-white text-blue-dark hover:bg-category-blue-light-90 rounded-[10px] flex flex-col items-center text-xs leading-none text-center font-light gap-0.5 px-2 py-1"
                            href={getUrlPath(item)}
                          >
                            {item.promoIcon && (
                              <span className="flex items-center w-6 h-6 shrink-0 text-neutral-30">
                                <Icon
                                  icon={item.promoIcon}
                                  className="w-full h-full mx-auto"
                                />
                              </span>
                            )}
                            {item.promoTitle ?? item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                )}
                <div className="hidden gap-6 px-6 lg:flex">
                  <a href="#" className="button button-primary">
                    Regístrate
                  </a>
                  <a href="#" className="button button-outline">
                    Inicia sesión
                  </a>
                </div>
              </div>

              <div className="relative z-10 flex items-center lg:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center p-2 text-gray-400 rounded-md hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                  <span className="sr-only">Open menu</span>
                  {open ? (
                    <XMarkIcon className="block w-6 h-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block w-6 h-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
            {/* Bottom */}
            {mainNavCollectionMenu.items?.length > 0 && (
              <MegaMenu mainNavCollection={mainNavCollectionMenu} />
            )}
          </div>
          <hr className="min-w-[100vw] -mx-[50vw] border-neutral-80 hidden lg:block" />

          {/* Mobile */}
          <Disclosure.Panel
            as="nav"
            className="lg:hidden"
            aria-label="Menu mobile"
          >
            <ul className="px-2 pt-2 pb-3 space-y-1">
              {mainNavCollection?.items?.map((item, index) => (
                <li key={item.name}>
                  <Disclosure.Button
                    as="a"
                    href={item.href}
                    className={classNames(
                      index === 0
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-900 hover:bg-gray-50 hover:text-gray-900",
                      "block rounded-md py-2 px-3 text-base font-medium"
                    )}
                    aria-current={index === 0 ? "page" : undefined}
                  >
                    {item.name}
                  </Disclosure.Button>
                </li>
              ))}
              <hr />
              {/* {utility?.map((item, index) => (
                <li key={item.name}>
                  <Disclosure.Button
                    as="a"
                    href={item.href}
                    className={classNames(
                      index === 0
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-900 hover:bg-gray-50 hover:text-gray-900",
                      "block rounded-md py-2 px-3 text-base font-medium"
                    )}
                  >
                    {item.name}
                  </Disclosure.Button>
                </li>
              ))} */}
            </ul>
          </Disclosure.Panel>
        </div>
      )}
    </Disclosure>
  );
};

export default HeaderBlock;
