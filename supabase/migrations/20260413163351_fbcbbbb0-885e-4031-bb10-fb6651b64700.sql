
-- Re-create triggers that were missing
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_content_updated_at
  BEFORE UPDATE ON public.content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add RLS policy for video_servers (authenticated read)
ALTER TABLE public.video_servers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read video servers"
  ON public.video_servers FOR SELECT TO authenticated USING (true);

-- Seed content
INSERT INTO public.content (id, title, description, type, release_year, rating, poster_url, banner_url, duration_minutes, language, status, featured) VALUES
  ('c001c001-0000-0000-0000-000000000001', 'Void Horizon', 'In the aftermath of a cosmic cataclysm, humanity''s last fleet drifts through uncharted space. Captain Yuki Tanaka must navigate political intrigue and alien encounters to find a new home for the remnants of civilization.', 'series', 2024, 9.2, '/posters/void-horizon.jpg', '/banners/void-horizon.jpg', 24, 'Japanese', 'ongoing', true),
  ('c001c001-0000-0000-0000-000000000002', 'Ethereal Bloom', 'A young botanist discovers that the flowers in her grandmother''s garden hold the key to an ancient magical realm. As the boundary between worlds weakens, she must master forgotten arts to prevent both realities from collapsing.', 'movie', 2024, 9.5, '/posters/ethereal-bloom.jpg', '/banners/ethereal-bloom.jpg', 125, 'Japanese', 'completed', true),
  ('c001c001-0000-0000-0000-000000000003', 'Scarlet Night', 'Detective Ren Akiyama investigates a series of impossible murders in rain-soaked Neo-Kyoto. Each victim bears a supernatural mark, leading him into a hidden world of ancient vampiric clans waging a shadow war.', 'series', 2023, 9.0, '/posters/scarlet-night.jpg', '/banners/scarlet-night.jpg', 23, 'Japanese', 'completed', false),
  ('c001c001-0000-0000-0000-000000000004', 'Cyber Pulse', 'In Neo-Tokyo 2187, street racer Mika discovers her neural implant contains a rogue AI that could topple the corporate oligarchy. Hunted by enforcers and hackers alike, she must decide: delete it or unleash it.', 'series', 2024, 9.6, '/posters/cyber-pulse.jpg', '/banners/cyber-pulse.jpg', 24, 'Japanese', 'ongoing', true),
  ('c001c001-0000-0000-0000-000000000005', 'Frost Heart', 'An ice sculptor in a perpetually frozen kingdom discovers warmth is returning — and with it, ancient creatures sealed beneath the glaciers. A tale of beauty, sacrifice, and the courage to let go.', 'series', 2023, 9.4, '/posters/frost-heart.jpg', '/banners/frost-heart.jpg', 24, 'Japanese', 'completed', false),
  ('c001c001-0000-0000-0000-000000000006', 'Storm Soul', 'Twin siblings born during a legendary tempest inherit the power to control weather. When a mysterious organization hunts them for their abilities, they must master their gifts and uncover their true origin.', 'series', 2024, 8.8, '/posters/storm-soul.jpg', '/banners/storm-soul.jpg', 24, 'English', 'ongoing', false),
  ('c001c001-0000-0000-0000-000000000007', 'Whisper of Zen', 'A retired samurai opens a tea house in Edo-period Japan. Through the quiet ritual of tea ceremonies, he heals the broken spirits of warriors, artists, and wanderers who seek refuge from a changing world.', 'series', 2022, 9.3, '/posters/whisper-zen.jpg', '/banners/whisper-zen.jpg', 22, 'Japanese', 'completed', false),
  ('c001c001-0000-0000-0000-000000000008', 'Hyper Rails', 'The most dangerous sport in the galaxy: zero-gravity mecha racing through asteroid fields. Rookie pilot Kai enters the Grand Circuit to save his colony, but the track holds secrets that could change everything.', 'series', 2024, 8.9, '/posters/hyper-rails.jpg', '/banners/hyper-rails.jpg', 24, 'Japanese', 'ongoing', false),
  ('c001c001-0000-0000-0000-000000000009', 'Skybound Realm', 'Above the clouds lies a civilization of floating islands connected by ancient sky-bridges. When the bridges begin to shatter, a young cartographer must race to map the forgotten paths before the islands fall.', 'movie', 2023, 9.7, '/posters/skybound-realm.jpg', '/banners/skybound-realm.jpg', 140, 'Japanese', 'completed', true),
  ('c001c001-0000-0000-0000-000000000010', 'Silent Peak', 'Twelve strangers receive invitations to a remote mountain observatory. As a blizzard seals them in, they realize the host knows their darkest secrets — and someone among them is a killer.', 'series', 2022, 8.7, '/posters/silent-peak.jpg', '/banners/silent-peak.jpg', 45, 'Japanese', 'completed', false),
  ('c001c001-0000-0000-0000-000000000011', 'Dream Weaver', 'A gifted artist can paint doorways into people''s dreams. When her paintings start bleeding into reality, she must enter the dreamscape of a comatose stranger to stop a nightmare from consuming the waking world.', 'movie', 2024, 9.1, '/posters/dream-weaver.jpg', '/banners/dream-weaver.jpg', 110, 'Korean', 'completed', false),
  ('c001c001-0000-0000-0000-000000000012', 'Neon Drifters', 'In a lawless megacity, a crew of outcasts runs heists against the corporations that destroyed their neighborhoods. But their latest job uncovers a conspiracy that could ignite a revolution — or destroy them all.', 'series', 2023, 9.3, '/posters/neon-drifters.jpg', '/banners/neon-drifters.jpg', 24, 'English', 'ongoing', false);

-- Seed content_genres (using genre IDs from the genres table)
INSERT INTO public.content_genres (content_id, genre_id) VALUES
  -- Void Horizon: Action, Sci-Fi
  ('c001c001-0000-0000-0000-000000000001', 'b5205207-0a03-472d-81ee-83f4644d4dde'),
  ('c001c001-0000-0000-0000-000000000001', '52c4609b-2608-4b4e-8cc7-0743f786282c'),
  -- Ethereal Bloom: Fantasy, Adventure
  ('c001c001-0000-0000-0000-000000000002', '8bb4cc09-b04c-4241-84ea-0e8bfed2e19e'),
  ('c001c001-0000-0000-0000-000000000002', '4a81be16-7abb-4af5-8cfb-e08e79f22ac9'),
  -- Scarlet Night: Supernatural, Thriller
  ('c001c001-0000-0000-0000-000000000003', '90108936-6b7c-4601-801f-1d16501971c8'),
  ('c001c001-0000-0000-0000-000000000003', 'c1a850b4-f1e5-4d4d-8471-72052a5932ec'),
  -- Cyber Pulse: Cyberpunk, Drama, Action
  ('c001c001-0000-0000-0000-000000000004', '04e93b56-dc81-4f1a-9ba3-7263a7a4154d'),
  ('c001c001-0000-0000-0000-000000000004', '46c0536f-c74c-4cac-b2c8-5dd7ece7542f'),
  ('c001c001-0000-0000-0000-000000000004', 'b5205207-0a03-472d-81ee-83f4644d4dde'),
  -- Frost Heart: Fantasy, Drama
  ('c001c001-0000-0000-0000-000000000005', '8bb4cc09-b04c-4241-84ea-0e8bfed2e19e'),
  ('c001c001-0000-0000-0000-000000000005', '46c0536f-c74c-4cac-b2c8-5dd7ece7542f'),
  -- Storm Soul: Action, Adventure
  ('c001c001-0000-0000-0000-000000000006', 'b5205207-0a03-472d-81ee-83f4644d4dde'),
  ('c001c001-0000-0000-0000-000000000006', '4a81be16-7abb-4af5-8cfb-e08e79f22ac9'),
  -- Whisper of Zen: Slice of Life, Drama
  ('c001c001-0000-0000-0000-000000000007', '127f16f6-f4c8-450d-9dda-d630e6152fc1'),
  ('c001c001-0000-0000-0000-000000000007', '46c0536f-c74c-4cac-b2c8-5dd7ece7542f'),
  -- Hyper Rails: Mecha, Sci-Fi
  ('c001c001-0000-0000-0000-000000000008', '66348660-1ac4-4e48-b004-666b8dd673c9'),
  ('c001c001-0000-0000-0000-000000000008', '52c4609b-2608-4b4e-8cc7-0743f786282c'),
  -- Skybound Realm: Fantasy, Adventure
  ('c001c001-0000-0000-0000-000000000009', '8bb4cc09-b04c-4241-84ea-0e8bfed2e19e'),
  ('c001c001-0000-0000-0000-000000000009', '4a81be16-7abb-4af5-8cfb-e08e79f22ac9'),
  -- Silent Peak: Mystery, Thriller
  ('c001c001-0000-0000-0000-000000000010', '61093a9a-ce7d-48f4-85cd-3f790bb19bde'),
  ('c001c001-0000-0000-0000-000000000010', 'c1a850b4-f1e5-4d4d-8471-72052a5932ec'),
  -- Dream Weaver: Fantasy, Romance
  ('c001c001-0000-0000-0000-000000000011', '8bb4cc09-b04c-4241-84ea-0e8bfed2e19e'),
  ('c001c001-0000-0000-0000-000000000011', '1bd66a42-e197-488e-a118-0cd55a9b7b08'),
  -- Neon Drifters: Cyberpunk, Action
  ('c001c001-0000-0000-0000-000000000012', '04e93b56-dc81-4f1a-9ba3-7263a7a4154d'),
  ('c001c001-0000-0000-0000-000000000012', 'b5205207-0a03-472d-81ee-83f4644d4dde');

-- Seed episodes for series
-- Void Horizon (8 eps)
INSERT INTO public.episodes (id, content_id, season_number, episode_number, title, description, duration_seconds) VALUES
  ('e0010001-0000-0000-0000-000000000001', 'c001c001-0000-0000-0000-000000000001', 1, 1, 'The Last Dawn', 'The fleet awakens from cryo-sleep to find their star charts are wrong.', 1440),
  ('e0010001-0000-0000-0000-000000000002', 'c001c001-0000-0000-0000-000000000001', 1, 2, 'Void Signal', 'A mysterious transmission leads the fleet toward an uncharted nebula.', 1380),
  ('e0010001-0000-0000-0000-000000000003', 'c001c001-0000-0000-0000-000000000001', 1, 3, 'Gravity Well', 'The fleet is caught in a gravitational anomaly near a dying star.', 1500),
  ('e0010001-0000-0000-0000-000000000004', 'c001c001-0000-0000-0000-000000000001', 1, 4, 'First Contact', 'An alien vessel appears — and it''s been waiting for them.', 1420),
  ('e0010001-0000-0000-0000-000000000005', 'c001c001-0000-0000-0000-000000000001', 1, 5, 'The Accord', 'Diplomatic tensions rise as the aliens propose a dangerous alliance.', 1460),
  ('e0010001-0000-0000-0000-000000000006', 'c001c001-0000-0000-0000-000000000001', 1, 6, 'Breach', 'An intruder boards the flagship, revealing a traitor among the crew.', 1440),
  ('e0010001-0000-0000-0000-000000000007', 'c001c001-0000-0000-0000-000000000001', 1, 7, 'Dark Matter', 'The fleet enters a region where physics breaks down.', 1500),
  ('e0010001-0000-0000-0000-000000000008', 'c001c001-0000-0000-0000-000000000001', 1, 8, 'Horizon''s Edge', 'Yuki faces an impossible choice that will determine humanity''s fate.', 1520);

-- Scarlet Night (6 eps)
INSERT INTO public.episodes (id, content_id, season_number, episode_number, title, description, duration_seconds) VALUES
  ('e0030001-0000-0000-0000-000000000001', 'c001c001-0000-0000-0000-000000000003', 1, 1, 'Red Rain', 'A body is found drained of blood beneath the neon lights of Neo-Kyoto.', 1380),
  ('e0030001-0000-0000-0000-000000000002', 'c001c001-0000-0000-0000-000000000003', 1, 2, 'The Mark', 'Ren discovers the victims share an ancient symbol branded into their skin.', 1400),
  ('e0030001-0000-0000-0000-000000000003', 'c001c001-0000-0000-0000-000000000003', 1, 3, 'Bloodline', 'A centuries-old vampire reveals the truth behind the killings.', 1420),
  ('e0030001-0000-0000-0000-000000000004', 'c001c001-0000-0000-0000-000000000003', 1, 4, 'Shadow Court', 'Ren infiltrates the vampiric council hidden beneath the city.', 1440),
  ('e0030001-0000-0000-0000-000000000005', 'c001c001-0000-0000-0000-000000000003', 1, 5, 'Silver Edge', 'Armed with forbidden weapons, Ren wages war against the elder clans.', 1380),
  ('e0030001-0000-0000-0000-000000000006', 'c001c001-0000-0000-0000-000000000003', 1, 6, 'Scarlet Dawn', 'The final confrontation as Ren faces the Crimson Lord.', 1500);

-- Cyber Pulse (10 eps)
INSERT INTO public.episodes (id, content_id, season_number, episode_number, title, description, duration_seconds) VALUES
  ('e0040001-0000-0000-0000-000000000001', 'c001c001-0000-0000-0000-000000000004', 1, 1, 'Ignition', 'Street racer Mika''s implant activates during an illegal race.', 1440),
  ('e0040001-0000-0000-0000-000000000002', 'c001c001-0000-0000-0000-000000000004', 1, 2, 'Ghost in the Wire', 'The rogue AI begins communicating through Mika''s dreams.', 1380),
  ('e0040001-0000-0000-0000-000000000003', 'c001c001-0000-0000-0000-000000000004', 1, 3, 'Corporate Shadows', 'Mika discovers who created the AI — and why they want it back.', 1500),
  ('e0040001-0000-0000-0000-000000000004', 'c001c001-0000-0000-0000-000000000004', 1, 4, 'Neural Storm', 'The AI''s power surges, threatening to overwrite Mika''s personality.', 1440),
  ('e0040001-0000-0000-0000-000000000005', 'c001c001-0000-0000-0000-000000000004', 1, 5, 'Underground', 'Mika joins a hacker collective fighting the corporate elite.', 1460),
  ('e0040001-0000-0000-0000-000000000006', 'c001c001-0000-0000-0000-000000000004', 1, 6, 'Firewall', 'A massive cyber attack hits Neo-Tokyo''s infrastructure.', 1440),
  ('e0040001-0000-0000-0000-000000000007', 'c001c001-0000-0000-0000-000000000004', 1, 7, 'System Crash', 'Mika''s allies are captured; she must choose who to save.', 1480),
  ('e0040001-0000-0000-0000-000000000008', 'c001c001-0000-0000-0000-000000000004', 1, 8, 'Overclock', 'Pushing the AI to its limits, Mika infiltrates the corporate tower.', 1500),
  ('e0040001-0000-0000-0000-000000000009', 'c001c001-0000-0000-0000-000000000004', 1, 9, 'Binary Choice', 'The truth about the AI''s purpose is revealed.', 1440),
  ('e0040001-0000-0000-0000-000000000010', 'c001c001-0000-0000-0000-000000000004', 1, 10, 'Pulse', 'Mika makes her final stand against the oligarchy.', 1560);

-- Frost Heart (8 eps)
INSERT INTO public.episodes (id, content_id, season_number, episode_number, title, description, duration_seconds) VALUES
  ('e0050001-0000-0000-0000-000000000001', 'c001c001-0000-0000-0000-000000000005', 1, 1, 'Thaw', 'The first crack appears in the eternal ice.', 1440),
  ('e0050001-0000-0000-0000-000000000002', 'c001c001-0000-0000-0000-000000000005', 1, 2, 'Crystal Memory', 'Ancient carvings reveal the truth about the frozen kingdom.', 1380),
  ('e0050001-0000-0000-0000-000000000003', 'c001c001-0000-0000-0000-000000000005', 1, 3, 'Beneath the Glacier', 'Something stirs in the depths of the ice.', 1420),
  ('e0050001-0000-0000-0000-000000000004', 'c001c001-0000-0000-0000-000000000005', 1, 4, 'Warm Blood', 'The sculptor meets a traveler from the south.', 1400),
  ('e0050001-0000-0000-0000-000000000005', 'c001c001-0000-0000-0000-000000000005', 1, 5, 'The Awakening', 'Creatures emerge from the melting ice.', 1460),
  ('e0050001-0000-0000-0000-000000000006', 'c001c001-0000-0000-0000-000000000005', 1, 6, 'Sacrifice', 'A terrible price must be paid to seal the creatures away.', 1440),
  ('e0050001-0000-0000-0000-000000000007', 'c001c001-0000-0000-0000-000000000005', 1, 7, 'Eternal Winter', 'The choice between warmth and survival.', 1500),
  ('e0050001-0000-0000-0000-000000000008', 'c001c001-0000-0000-0000-000000000005', 1, 8, 'Frost Heart', 'The sculptor''s masterpiece holds the key to everything.', 1520);

-- Storm Soul (6 eps)
INSERT INTO public.episodes (id, content_id, season_number, episode_number, title, description, duration_seconds) VALUES
  ('e0060001-0000-0000-0000-000000000001', 'c001c001-0000-0000-0000-000000000006', 1, 1, 'Born in Thunder', 'The twins'' powers manifest during a catastrophic storm.', 1440),
  ('e0060001-0000-0000-0000-000000000002', 'c001c001-0000-0000-0000-000000000006', 1, 2, 'Eye of the Storm', 'On the run, the siblings discover others like them.', 1380),
  ('e0060001-0000-0000-0000-000000000003', 'c001c001-0000-0000-0000-000000000006', 1, 3, 'Lightning Strike', 'The organization closes in with weather-suppression technology.', 1500),
  ('e0060001-0000-0000-0000-000000000004', 'c001c001-0000-0000-0000-000000000006', 1, 4, 'Calm Before', 'A moment of peace before the final confrontation.', 1420),
  ('e0060001-0000-0000-0000-000000000005', 'c001c001-0000-0000-0000-000000000006', 1, 5, 'Tempest', 'The twins unleash their full power in a climactic battle.', 1460),
  ('e0060001-0000-0000-0000-000000000006', 'c001c001-0000-0000-0000-000000000006', 1, 6, 'After the Rain', 'The aftermath reveals their true heritage.', 1440);

-- Whisper of Zen (6 eps)
INSERT INTO public.episodes (id, content_id, season_number, episode_number, title, description, duration_seconds) VALUES
  ('e0070001-0000-0000-0000-000000000001', 'c001c001-0000-0000-0000-000000000007', 1, 1, 'First Steep', 'A wandering ronin arrives at the tea house seeking shelter.', 1320),
  ('e0070001-0000-0000-0000-000000000002', 'c001c001-0000-0000-0000-000000000007', 1, 2, 'The Broken Cup', 'A court painter hiding from political persecution finds solace.', 1340),
  ('e0070001-0000-0000-0000-000000000003', 'c001c001-0000-0000-0000-000000000007', 1, 3, 'Autumn Leaves', 'A young woman preparing for an arranged marriage seeks courage.', 1360),
  ('e0070001-0000-0000-0000-000000000004', 'c001c001-0000-0000-0000-000000000007', 1, 4, 'The Way of Tea', 'The samurai''s past catches up with him.', 1380),
  ('e0070001-0000-0000-0000-000000000005', 'c001c001-0000-0000-0000-000000000007', 1, 5, 'Still Water', 'A rival swordsman comes seeking a final duel.', 1320),
  ('e0070001-0000-0000-0000-000000000006', 'c001c001-0000-0000-0000-000000000007', 1, 6, 'The Last Cup', 'The tea house faces closure as the era changes.', 1400);

-- Hyper Rails (6 eps)
INSERT INTO public.episodes (id, content_id, season_number, episode_number, title, description, duration_seconds) VALUES
  ('e0080001-0000-0000-0000-000000000001', 'c001c001-0000-0000-0000-000000000008', 1, 1, 'Qualifier', 'Kai enters the amateur league with a salvaged mecha.', 1440),
  ('e0080001-0000-0000-0000-000000000002', 'c001c001-0000-0000-0000-000000000008', 1, 2, 'Boost Mode', 'Kai discovers a hidden ability in his mecha''s AI core.', 1400),
  ('e0080001-0000-0000-0000-000000000003', 'c001c001-0000-0000-0000-000000000008', 1, 3, 'Asteroid Run', 'The most dangerous qualifying race through an asteroid belt.', 1500),
  ('e0080001-0000-0000-0000-000000000004', 'c001c001-0000-0000-0000-000000000008', 1, 4, 'Rivals', 'Kai faces the reigning champion and uncovers a conspiracy.', 1440),
  ('e0080001-0000-0000-0000-000000000005', 'c001c001-0000-0000-0000-000000000008', 1, 5, 'Overdrive', 'The Grand Circuit begins with devastating stakes.', 1460),
  ('e0080001-0000-0000-0000-000000000006', 'c001c001-0000-0000-0000-000000000008', 1, 6, 'Finish Line', 'The final race and the secret of the track revealed.', 1520);

-- Silent Peak (6 eps)
INSERT INTO public.episodes (id, content_id, season_number, episode_number, title, description, duration_seconds) VALUES
  ('e0100001-0000-0000-0000-000000000001', 'c001c001-0000-0000-0000-000000000010', 1, 1, 'Invitation', 'Twelve strangers arrive at a remote mountain observatory.', 2700),
  ('e0100001-0000-0000-0000-000000000002', 'c001c001-0000-0000-0000-000000000010', 1, 2, 'Snowbound', 'The blizzard seals them in; the first secret is exposed.', 2700),
  ('e0100001-0000-0000-0000-000000000003', 'c001c001-0000-0000-0000-000000000010', 1, 3, 'Confession', 'The host reveals each guest''s darkest truth.', 2700),
  ('e0100001-0000-0000-0000-000000000004', 'c001c001-0000-0000-0000-000000000010', 1, 4, 'The First Death', 'A guest is found dead in the locked observatory.', 2700),
  ('e0100001-0000-0000-0000-000000000005', 'c001c001-0000-0000-0000-000000000010', 1, 5, 'Trust No One', 'Paranoia and accusations tear the group apart.', 2700),
  ('e0100001-0000-0000-0000-000000000006', 'c001c001-0000-0000-0000-000000000010', 1, 6, 'The Summit', 'The truth about the host and the killer is revealed.', 2700);

-- Neon Drifters (8 eps)
INSERT INTO public.episodes (id, content_id, season_number, episode_number, title, description, duration_seconds) VALUES
  ('e0120001-0000-0000-0000-000000000001', 'c001c001-0000-0000-0000-000000000012', 1, 1, 'The Crew', 'Meet the outcasts planning their biggest heist yet.', 1440),
  ('e0120001-0000-0000-0000-000000000002', 'c001c001-0000-0000-0000-000000000012', 1, 2, 'Blueprint', 'The plan takes shape as they scout the corporate tower.', 1400),
  ('e0120001-0000-0000-0000-000000000003', 'c001c001-0000-0000-0000-000000000012', 1, 3, 'Inside Job', 'One of the crew goes undercover as a corporate employee.', 1460),
  ('e0120001-0000-0000-0000-000000000004', 'c001c001-0000-0000-0000-000000000012', 1, 4, 'Double Cross', 'A betrayal threatens to unravel everything.', 1440),
  ('e0120001-0000-0000-0000-000000000005', 'c001c001-0000-0000-0000-000000000012', 1, 5, 'The Vault', 'They breach the most secure vault in the megacity.', 1500),
  ('e0120001-0000-0000-0000-000000000006', 'c001c001-0000-0000-0000-000000000012', 1, 6, 'Exposed', 'The conspiracy data they stole changes everything.', 1440),
  ('e0120001-0000-0000-0000-000000000007', 'c001c001-0000-0000-0000-000000000012', 1, 7, 'Revolution', 'The crew broadcasts the truth to the entire city.', 1460),
  ('e0120001-0000-0000-0000-000000000008', 'c001c001-0000-0000-0000-000000000012', 1, 8, 'New Dawn', 'The aftermath of the revolution and the crew''s fate.', 1520);

-- Seed video servers (one per episode, placeholder URLs)
INSERT INTO public.video_servers (episode_id, server_name, stream_url, quality, language)
SELECT e.id, 'Main Server', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', '1080p', 'Japanese'
FROM public.episodes e;
