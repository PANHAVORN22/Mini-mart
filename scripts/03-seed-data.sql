-- Insert sample beers
INSERT INTO public.beers (name, type, description, price, alcohol_content, volume, stock, image_url, is_premium) VALUES
('Golden Ale', 'Ale', 'A smooth and refreshing golden ale with hints of citrus and honey', 8.99, 5.2, 355, 50, '/golden-ale-beer-bottle.jpg', false),
('Dark Stout', 'Stout', 'Rich and creamy stout with notes of coffee and chocolate', 10.99, 6.8, 355, 30, '/dark-stout-beer-bottle.jpg', false),
('Hoppy IPA', 'IPA', 'Bold and hoppy India Pale Ale with tropical fruit flavors', 9.99, 6.5, 355, 45, '/ipa-beer-bottle.jpg', false),
('Wheat Beer', 'Wheat', 'Light and crisp wheat beer perfect for summer days', 7.99, 4.8, 355, 60, '/wheat-beer-bottle.jpg', false),
('Amber Lager', 'Lager', 'Smooth amber lager with a balanced malt profile', 8.49, 5.0, 355, 40, '/amber-lager-beer-bottle.jpg', false),
('Belgian Tripel', 'Belgian', 'Complex Belgian-style ale with spicy and fruity notes', 12.99, 8.5, 355, 20, '/belgian-tripel-beer-bottle.jpg', true),
('Imperial Stout', 'Stout', 'Bold imperial stout aged in bourbon barrels', 14.99, 10.2, 355, 15, '/imperial-stout-beer-bottle.jpg', true),
('Sour Ale', 'Sour', 'Tart and refreshing sour ale with berry undertones', 11.99, 5.5, 355, 25, '/sour-ale-beer-bottle.jpg', true);

-- Note: Users will be created through Supabase Auth signup
-- Admin user should be created manually with role='admin' after signup
