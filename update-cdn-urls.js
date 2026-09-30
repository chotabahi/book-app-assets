const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');

if (!fs.existsSync('./serviceAccountKey.json')) {
  console.error('\n❌ Error: "serviceAccountKey.json" was not found in this folder!');
  process.exit(1);
}

const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const mapping = {
  booksByTitle: {
    "The Great Gatsby": "https://cdn.jsdelivr.net/gh/chotabahi/book-app-assets@main/covers/the-great-gatsby.jpg",
    "To Kill a Mockingbird": "https://cdn.jsdelivr.net/gh/chotabahi/book-app-assets@main/covers/to-kill-a-mockingbird.jpg",
    "1984": "https://cdn.jsdelivr.net/gh/chotabahi/book-app-assets@main/covers/1984.jpg",
    "Gone Girl": "https://cdn.jsdelivr.net/gh/chotabahi/book-app-assets@main/covers/gone-girl.jpg",
    "The Girl with the Dragon Tattoo": "https://cdn.jsdelivr.net/gh/chotabahi/book-app-assets@main/covers/the-girl-with-the-dragon-tattoo.jpg",
    "Big Little Lies": "https://cdn.jsdelivr.net/gh/chotabahi/book-app-assets@main/covers/big-little-lies.jpg",
    "A Brief History of Time": "https://cdn.jsdelivr.net/gh/chotabahi/book-app-assets@main/covers/a-brief-history-of-time.jpg",
    "The Selfish Gene": "https://cdn.jsdelivr.net/gh/chotabahi/book-app-assets@main/covers/the-selfish-gene.jpg",
    "Sapiens": "https://cdn.jsdelivr.net/gh/chotabahi/book-app-assets@main/covers/sapiens.jpg",
    "The Diary of a Young Girl": "https://cdn.jsdelivr.net/gh/chotabahi/book-app-assets@main/covers/the-diary-of-a-young-girl.jpg",
    "Guns, Germs and Steel": "https://cdn.jsdelivr.net/gh/chotabahi/book-app-assets@main/covers/guns-germs-and-steel.jpg",
    "The Silk Roads": "https://cdn.jsdelivr.net/gh/chotabahi/book-app-assets@main/covers/the-silk-roads.jpg",
    "The Hobbit": "https://cdn.jsdelivr.net/gh/chotabahi/book-app-assets@main/covers/the-hobbit.jpg",
    "Harry Potter and the Sorcerers Stone": "https://cdn.jsdelivr.net/gh/chotabahi/book-app-assets@main/covers/harry-potter-and-the-sorcerers-stone.jpg",
    "The Name of the Wind": "https://cdn.jsdelivr.net/gh/chotabahi/book-app-assets@main/covers/the-name-of-the-wind.jpg",
    "Pride and Prejudice": "https://cdn.jsdelivr.net/gh/chotabahi/book-app-assets@main/covers/pride-and-prejudice.jpg",
    "The Notebook": "https://cdn.jsdelivr.net/gh/chotabahi/book-app-assets@main/covers/the-notebook.jpg",
    "Outlander": "https://cdn.jsdelivr.net/gh/chotabahi/book-app-assets@main/covers/outlander.jpg",
    "Steve Jobs": "https://cdn.jsdelivr.net/gh/chotabahi/book-app-assets@main/covers/steve-jobs.jpg",
    "Becoming": "https://cdn.jsdelivr.net/gh/chotabahi/book-app-assets@main/covers/becoming.jpg",
    "Long Walk to Freedom": "https://cdn.jsdelivr.net/gh/chotabahi/book-app-assets@main/covers/long-walk-to-freedom.jpg",
    "Clean Code": "https://cdn.jsdelivr.net/gh/chotabahi/book-app-assets@main/covers/clean-code.jpg",
    "The Pragmatic Programmer": "https://cdn.jsdelivr.net/gh/chotabahi/book-app-assets@main/covers/the-pragmatic-programmer.jpg",
    "Zero to One": "https://cdn.jsdelivr.net/gh/chotabahi/book-app-assets@main/covers/zero-to-one.jpg"
  },
  categoriesById: {
    "fiction": "https://cdn.jsdelivr.net/gh/chotabahi/book-app-assets@main/categories/fiction.jpg",
    "mystery": "https://cdn.jsdelivr.net/gh/chotabahi/book-app-assets@main/categories/mystery.jpg",
    "science": "https://cdn.jsdelivr.net/gh/chotabahi/book-app-assets@main/categories/science.jpg",
    "history": "https://cdn.jsdelivr.net/gh/chotabahi/book-app-assets@main/categories/history.jpg",
    "fantasy": "https://cdn.jsdelivr.net/gh/chotabahi/book-app-assets@main/categories/fantasy.jpg",
    "romance": "https://cdn.jsdelivr.net/gh/chotabahi/book-app-assets@main/categories/romance.jpg",
    "biography": "https://cdn.jsdelivr.net/gh/chotabahi/book-app-assets@main/categories/biography.jpg",
    "technology": "https://cdn.jsdelivr.net/gh/chotabahi/book-app-assets@main/categories/technology.jpg"
  }
};

async function updateFirestoreCdnUrls() {
  const batch = db.batch();
  let updatedCount = 0;

  console.log('🔄 Matching and updating books...');
  const booksSnap = await db.collection('books').get();
  
  booksSnap.forEach(doc => {
    const data = doc.data();
    const cdnUrl = mapping.booksByTitle[data.title];
    if (cdnUrl) {
      batch.update(doc.ref, { coverUrl: cdnUrl });
      console.log(`  ✓ Linked book: "${data.title}" -> ${cdnUrl}`);
      updatedCount++;
    } else {
      console.warn(`  ⚠ No CDN URL mapped for book title: "${data.title}"`);
    }
  });

  console.log('\n🔄 Updating categories...');
  for (const [catId, url] of Object.entries(mapping.categoriesById)) {
    const catRef = db.collection('categories').doc(catId);
    batch.update(catRef, { imageUrl: url });
    console.log(`  ✓ Linked category: [${catId}] -> ${url}`);
    updatedCount++;
  }

  await batch.commit();
  console.log(`\n✅ Successfully updated ${updatedCount} Firestore documents!`);
}

updateFirestoreCdnUrls().catch(console.error);
