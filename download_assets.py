import os
import json
import ssl
import urllib.request
import urllib.parse

# Bypass local SSL verification checks for downloading asset images
ssl._create_default_https_context = ssl._create_unverified_context

# 1. Target folders
os.makedirs("covers", exist_ok=True)
os.makedirs("categories", exist_ok=True)

# 2. Book titles to download
books = [
    "The Great Gatsby", "To Kill a Mockingbird", "1984", "Gone Girl",
    "The Girl with the Dragon Tattoo", "Big Little Lies", "A Brief History of Time",
    "The Selfish Gene", "Sapiens", "The Diary of a Young Girl",
    "Guns, Germs and Steel", "The Silk Roads", "The Hobbit",
    "Harry Potter and the Sorcerers Stone", "The Name of the Wind",
    "Pride and Prejudice", "The Notebook", "Outlander", "Steve Jobs",
    "Becoming", "Long Walk to Freedom", "Clean Code",
    "The Pragmatic Programmer", "Zero to One"
]

# 3. Categories and matching Unsplash images
categories = {
    "fiction": "https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=600&auto=format&fit=crop",
    "mystery": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&auto=format&fit=crop",
    "science": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop",
    "history": "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=600&auto=format&fit=crop",
    "fantasy": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop",
    "romance": "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600&auto=format&fit=crop",
    "biography": "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop",
    "technology": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop"
}

def to_kebab_case(text):
    return text.lower().replace(" ", "-").replace("'", "").replace(",", "")

print("=== 1/2 DOWNLOADING BOOK COVERS (Open Library) ===")
for title in books:
    filename = f"covers/{to_kebab_case(title)}.jpg"
    print(f"Fetching: {title}...")
    
    downloaded = False
    try:
        # Search Open Library for cover ID
        query = urllib.parse.quote(title)
        url = f"https://openlibrary.org/search.json?title={query}"
        
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode())
            
        docs = data.get("docs", [])
        cover_id = None
        for doc in docs:
            if "cover_i" in doc:
                cover_id = doc["cover_i"]
                break
                
        if cover_id:
            img_url = f"https://covers.openlibrary.org/b/id/{cover_id}-L.jpg"
            urllib.request.urlretrieve(img_url, filename)
            print(f"  ✓ Saved to {filename}")
            downloaded = True
    except Exception as e:
        print(f"  ⚠️ Could not fetch from Open Library ({e})")

    # Fallback placeholder if Open Library search failed or returned no cover
    if not downloaded:
        try:
            placeholder_url = f"https://placehold.co/400x600/1e293b/ffffff.jpg?text={urllib.parse.quote(title)}"
            urllib.request.urlretrieve(placeholder_url, filename)
            print(f"  ✓ Created fallback cover for {filename}")
        except Exception as e:
            print(f"  ❌ Error creating placeholder for {title}: {e}")

print("\n=== 2/2 DOWNLOADING CATEGORY THUMBNAILS (Unsplash Source) ===")
for cat, img_url in categories.items():
    filename = f"categories/{cat}.jpg"
    try:
        urllib.request.urlretrieve(img_url, filename)
        print(f"  ✓ Saved category [{cat}] to {filename}")
    except Exception as e:
        print(f"  ❌ Error downloading category {cat}: {e}")

print("\n🎉 All images processed successfully!")