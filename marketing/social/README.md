# Social packs

One folder per insight article, made by `node scripts/social.mjs`:

| File | Use |
|---|---|
| `linkedin.txt` | Post copy for the company page. The link shows a preview card. |
| `linkedin-1200x627.png` | Optional image to attach instead of the link preview |
| `instagram.txt` | Caption. Instagram doesn't make links clickable, so it points to the link in bio. |
| `instagram-1080x1350.png` | Portrait post image (4:5, Instagram's largest feed size) |

Every figure comes from the article's own stats, with the wording and brackets kept as written.

Commands:

    node scripts/social.mjs                  newest article only
    node scripts/social.mjs <slug>           one article
    node scripts/social.mjs --all            all of them

Nothing is posted automatically. Read the copy, edit it if you like, then post.

## Sending to Buffer

`node scripts/social-buffer.mjs` sends the newest pack to every LinkedIn and Instagram channel connected in Buffer, **as drafts**. Nothing goes out until you schedule it in Buffer.

1. In Buffer, connect the Minshall Group LinkedIn page and the Instagram Business account.
2. Create an API key at publish.buffer.com/settings/api, then store it in the Keychain. The command asks you to paste the key, which keeps it out of files and out of your shell history:

       security add-generic-password -s minshall-buffer -a api -w

3. Check the channels: `node scripts/social-buffer.mjs --channels`
4. After publishing an article: `node scripts/social.mjs`, push the site (Buffer fetches the images from minshallgroup.com/social/…), then `node scripts/social-buffer.mjs`.

Add `--dry-run` to see exactly what would be sent.
