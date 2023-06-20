import { defineConfig } from "astro/config";
import storyblok from "@storyblok/astro";

// https://astro.build/config
export default defineConfig({
  integrations: [
    storyblok({
      accessToken: "<your-access-token>",
      apiOptions: {
        cache: { clear: "auto", type: "memory" },
      },
      components: {
        rich_text: "storyblok/RichText",
        button: "storyblok/Button",
      },
    }),
  ],
});
