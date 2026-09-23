-- ==============================================================================
-- CAKE N CRAVE - BOUTIQUE EGGLESS PÂTISSERIE (JAIPUR)
-- SUPABASE PRODUCTION DATABASE SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES
-- Migration: 001_initial_schema.sql
-- ==============================================================================

-- 1. ROLE-BASED ACCESS CONTROL (RBAC)
-- Table to store authorized admin users linked to auth.users
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'super_admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_user_role UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Helper security definer function to check if current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = auth.uid()
          AND role IN ('admin', 'super_admin')
    );
$$;

-- RLS policies for user_roles
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
CREATE POLICY "Admins can view all user roles"
    ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Super admins can manage user roles" ON public.user_roles;
CREATE POLICY "Super admins can manage user roles"
    ON public.user_roles
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'super_admin'
        )
    );

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image TEXT,
    item_count INT DEFAULT 0,
    display_order INT DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Public can view published categories
DROP POLICY IF EXISTS "Public can view published categories" ON public.categories;
CREATE POLICY "Public can view published categories"
    ON public.categories
    FOR SELECT
    USING (is_published = true OR public.is_admin());

-- Only admins can insert, update, or delete categories
DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
CREATE POLICY "Admins can insert categories"
    ON public.categories
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
CREATE POLICY "Admins can update categories"
    ON public.categories
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;
CREATE POLICY "Admins can delete categories"
    ON public.categories
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    flavour_tag TEXT,
    description TEXT,
    price NUMERIC NOT NULL CHECK (price >= 0),
    weight_prices JSONB DEFAULT '{}'::jsonb,
    images TEXT[] DEFAULT '{}'::text[],
    featured BOOLEAN NOT NULL DEFAULT false,
    is_new BOOLEAN NOT NULL DEFAULT false,
    is_published BOOLEAN NOT NULL DEFAULT true,
    is_available BOOLEAN NOT NULL DEFAULT true,
    occasions TEXT[] DEFAULT '{}'::text[],
    available_sizes TEXT[] DEFAULT '{}'::text[],
    available_flavours TEXT[] DEFAULT '{}'::text[],
    customization_options TEXT[] DEFAULT '{}'::text[],
    advance_order_notice TEXT DEFAULT 'Please order at least 24 hours in advance',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Public can view published & available products; admins can view all
DROP POLICY IF EXISTS "Public can view published products" ON public.products;
CREATE POLICY "Public can view published products"
    ON public.products
    FOR SELECT
    USING ((is_published = true AND is_available = true) OR public.is_admin());

-- Only admins can manage products
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products"
    ON public.products
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products"
    ON public.products
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products"
    ON public.products
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- 4. ORDERS TABLE (Record orders placed through WhatsApp flow)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT,
    customer_phone TEXT,
    delivery_date TEXT,
    delivery_area TEXT,
    special_instructions TEXT,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
    internal_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow public insertion when customer submits an order before WhatsApp redirects
DROP POLICY IF EXISTS "Public can record placed order" ON public.orders;
CREATE POLICY "Public can record placed order"
    ON public.orders
    FOR INSERT
    WITH CHECK (true);

-- Only authenticated admins can read, update, or delete orders
DROP POLICY IF EXISTS "Admins can view orders" ON public.orders;
CREATE POLICY "Admins can view orders"
    ON public.orders
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders"
    ON public.orders
    FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;
CREATE POLICY "Admins can delete orders"
    ON public.orders
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- 5. DELIVERY SETTINGS
CREATE TABLE IF NOT EXISTS public.delivery_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    city TEXT NOT NULL DEFAULT 'Jaipur',
    delivery_fee NUMERIC NOT NULL DEFAULT 0,
    min_order_amount NUMERIC NOT NULL DEFAULT 0,
    advance_hours INT NOT NULL DEFAULT 24,
    available_slots TEXT[] DEFAULT ARRAY['Morning (10 AM - 1 PM)', 'Afternoon (1 PM - 5 PM)', 'Evening (5 PM - 9 PM)'],
    blocked_dates TEXT[] DEFAULT '{}'::text[],
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.delivery_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view delivery settings" ON public.delivery_settings;
CREATE POLICY "Public can view delivery settings"
    ON public.delivery_settings
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins can update delivery settings" ON public.delivery_settings;
CREATE POLICY "Admins can update delivery settings"
    ON public.delivery_settings
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 6. WEBSITE SETTINGS
CREATE TABLE IF NOT EXISTS public.website_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    brand_name TEXT NOT NULL DEFAULT 'Cake N Crave',
    whatsapp_number TEXT NOT NULL DEFAULT '7976541365',
    instagram_handle TEXT NOT NULL DEFAULT 'cakencrave_jaipur',
    business_location TEXT NOT NULL DEFAULT 'Jaipur, Rajasthan, India',
    announcement_text TEXT NOT NULL DEFAULT '100% Pure Eggless Pâtisserie · Baked Fresh Daily in Jaipur · WhatsApp: 7976541365',
    hero_heading TEXT NOT NULL DEFAULT 'Pure Eggless, Crafted for Wonder.',
    hero_description TEXT NOT NULL DEFAULT 'Jaipur’s boutique patisserie specializing in 100% eggless vintage tiered cakes, delicate bento treats, and luxury chocolate bouquets. Hand-baked fresh upon every order.',
    hero_image TEXT DEFAULT '/src/assets/images/luxury_patisserie_hero_1790175262764.jpg',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view website settings" ON public.website_settings;
CREATE POLICY "Public can view website settings"
    ON public.website_settings
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins can update website settings" ON public.website_settings;
CREATE POLICY "Admins can update website settings"
    ON public.website_settings
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 7. SUPABASE STORAGE BUCKET FOR PRODUCT IMAGES
-- (Run inside Supabase SQL Editor if storage bucket is not yet configured)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public can view images
DROP POLICY IF EXISTS "Public Access to Product Images" ON storage.objects;
CREATE POLICY "Public Access to Product Images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'product-images');

-- Only admins can upload images
DROP POLICY IF EXISTS "Admin Upload to Product Images" ON storage.objects;
CREATE POLICY "Admin Upload to Product Images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

-- Only admins can update images
DROP POLICY IF EXISTS "Admin Update Product Images" ON storage.objects;
CREATE POLICY "Admin Update Product Images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'product-images' AND public.is_admin());

-- Only admins can delete images
DROP POLICY IF EXISTS "Admin Delete Product Images" ON storage.objects;
CREATE POLICY "Admin Delete Product Images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'product-images' AND public.is_admin());

-- 8. INITIAL SEED DATA
-- Insert default delivery and website settings rows
INSERT INTO public.delivery_settings (id, city, delivery_fee, min_order_amount, advance_hours, available_slots, blocked_dates)
VALUES ('default', 'Jaipur', 0, 0, 24, ARRAY['Morning (10:00 AM - 1:00 PM)', 'Afternoon (1:00 PM - 5:00 PM)', 'Evening (5:00 PM - 9:00 PM)'], '{}'::text[])
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.website_settings (id, brand_name, whatsapp_number, instagram_handle, business_location, announcement_text, hero_heading, hero_description, hero_image)
VALUES ('default', 'Cake N Crave', '7976541365', 'cakencrave_jaipur', 'Jaipur, Rajasthan, India', '100% Pure Eggless Pâtisserie · Baked Fresh Daily in Jaipur · WhatsApp: 7976541365', 'Pure Eggless, Crafted for Wonder.', 'Jaipur’s boutique patisserie specializing in 100% eggless vintage tiered cakes, delicate bento treats, and luxury chocolate bouquets. Hand-baked fresh upon every order.', '/src/assets/images/luxury_patisserie_hero_1790175262764.jpg')
ON CONFLICT (id) DO NOTHING;

-- Insert default categories
INSERT INTO public.categories (id, name, slug, description, image, item_count, display_order, is_published)
VALUES
    ('cakes', 'Cakes', 'cakes', 'Bespoke luxury multi-tiered celebration cakes made fresh with 100% eggless artisanal recipes.', '/src/assets/images/hero_cake_display_1790174282202.jpg', 8, 1, true),
    ('bento-cakes', 'Bento Cakes', 'bento-cakes', 'Charming minimalist Korean lunchbox cakes customized with vintage piping and sweet handwritten notes.', '/src/assets/images/bento_cake_collection_1790174295252.jpg', 6, 2, true),
    ('hampers', 'Hampers', 'hampers', 'Hand-curated gift boxes packed with gourmet homemade treats, artisanal cookies, and lovely keepsakes.', '/src/assets/images/gourmet_gift_hamper_1790174308010.jpg', 5, 3, true),
    ('flower-bouquets', 'Flower Bouquets', 'flower-bouquets', 'Freshly assembled floral arrangements with romantic blush roses, baby’s breath, and satin ribbons.', '/src/assets/images/flower_chocolate_bouquet_1790174321849.jpg', 4, 4, true),
    ('chocolate-bouquets', 'Chocolate Bouquets', 'chocolate-bouquets', 'Decadent hand-crafted edible bouquets featuring premium truffles, Belgian chocolates, and artistic wrapping.', '/src/assets/images/flower_chocolate_bouquet_1790174321849.jpg', 4, 5, true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    image = EXCLUDED.image;
