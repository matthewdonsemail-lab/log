import type { Metadata } from "next";
import type { FC, ComponentProps } from "react";
import { notFound } from "next/navigation";
import { DocsPage, DocsBody } from "fumadocs-ui/page";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { Tabs, Tab } from "fumadocs-ui/components/tabs";
import { source } from "../../lib/source";
import { Mermaid } from "../../components/mdx/mermaid";

const components = { ...defaultMdxComponents, Tabs, Tab, Mermaid };

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

type MdxBody = FC<{ components?: typeof components } & ComponentProps<"div">>;

export default async function Page(props: PageProps) {
  const { slug } = await props.params;
  const page = source.getPage(slug);
  if (!page) notFound();

  const data = page.data as typeof page.data & {
    body: MdxBody;
    toc?: Parameters<typeof DocsPage>[0]["toc"];
  };
  const { body: Mdx, toc, title, description } = data;

  return (
    <DocsPage toc={toc} tableOfContent={{ enabled: true }}>
      <h1 className="text-[1.75em] font-semibold">{title}</h1>
      {description && (
        <p className="text-lg text-fd-muted-foreground mb-6">{description}</p>
      )}
      <DocsBody>
        <Mdx components={components} />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const page = source.getPage(slug);
  if (!page) return { title: "Not Found" };
  return {
    title: page.data.title,
    description: page.data.description,
  };
}

export function generateStaticParams() {
  return source.generateParams();
}