import { DataInteractive as HeadlessDataInteractive } from '@headlessui/react';
import NextLink from 'next/link';
import React from 'react';

export const Link = React.forwardRef(function Link(
  props: React.ComponentPropsWithoutRef<'a'> & { href: string },
  ref: React.ForwardedRef<HTMLAnchorElement>
) {
  // Destructure `href` from `props` and pass it explicitly to `NextLink`.
  // Spread the rest of the props to apply them to the anchor tag.
  const { href, ...rest } = props;

  return (
    <HeadlessDataInteractive>
      {/* Apply `href` directly from props and spread the rest */}
      <NextLink href={href} passHref>
        {/* `a` tag to utilize `ref` and apply remaining props */}
        <a ref={ref} {...rest} />
      </NextLink>
    </HeadlessDataInteractive>
  );
});
