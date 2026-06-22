import os

def bundle():
    print("===================================================")
    print("   Lumina: All-In-One HTML Bundler for AppsGeyser  ")
    print("===================================================")
    
    # Read files
    try:
      with open("index.html", "r", encoding="utf-8") as f:
          html = f.read()
      with open("style.css", "r", encoding="utf-8") as f:
          css = f.read()
      with open("curriculum.js", "r", encoding="utf-8") as f:
          curriculum = f.read()
      with open("visualizer.js", "r", encoding="utf-8") as f:
          visualizer = f.read()
      with open("app.js", "r", encoding="utf-8") as f:
          app = f.read()
    except FileNotFoundError as e:
      print(f"[!] Error: Could not find required source files: {e.filename}")
      return

    # Replace CSS Link
    css_link = '<link rel="stylesheet" href="style.css">'
    css_embedded = f"<style>\n{css}\n</style>"
    html = html.replace(css_link, css_embedded)

    # Replace JS Scripts
    scripts_to_replace = [
        ('<script src="curriculum.js"></script>', f"<script>\n{curriculum}\n</script>"),
        ('<script src="visualizer.js"></script>', f"<script>\n{visualizer}\n</script>"),
        ('<script src="app.js"></script>', f"<script>\n{app}\n</script>")
    ]

    for tag, code in scripts_to_replace:
        html = html.replace(tag, code)

    # Output file
    output_filename = "lumina-single-page.html"
    with open(output_filename, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"\n[Success] Generated all-in-one file: {output_filename}")
    print("👉 Open this file and copy its contents to paste into AppsGeyser!")

if __name__ == "__main__":
    bundle()
