import { createClient } from "@/lib/supabase/server";
import { getWishlistData } from "@/app/actions/wishlist";
import { WishlistView } from "@/components/wishlist/WishlistView";
import { Category } from "@/types";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Wishlist Bag - Story Finance",
  description: "Tas impian dan celengan virtual barang incaranmu.",
};

export default async function WishlistPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Parallel fetch wishlist data and categories
  const [wishlistData, { data: rawCategories }] = await Promise.all([
    getWishlistData(),
    supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true }),
  ]);

  const categories = (rawCategories || []) as Category[];

  const initialData = wishlistData || {
    items: [],
    totalSaved: 0,
    totalTarget: 0,
    activeCount: 0,
    completedCount: 0,
  };

  return (
    <WishlistView
      initialData={initialData}
      categories={categories}
    />
  );
}
