import { memo } from "react";

type JsonLdProps = {
	data: Record<string, unknown>;
};

const JsonLd = ({ data }: JsonLdProps) => (
	<script
		type="application/ld+json"
		dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
		suppressHydrationWarning
	/>
);

export default memo(JsonLd);



