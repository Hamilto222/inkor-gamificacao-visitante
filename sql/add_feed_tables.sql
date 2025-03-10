
-- Create prizes table
CREATE TABLE IF NOT EXISTS public.premios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  pontos_necessarios INTEGER NOT NULL DEFAULT 100,
  quantidade INTEGER NOT NULL DEFAULT 0,
  imagem_url TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create premio_grupo table for associating prizes with user groups
CREATE TABLE IF NOT EXISTS public.premio_grupo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  premio_id UUID NOT NULL REFERENCES public.premios(id) ON DELETE CASCADE,
  grupo_id UUID NOT NULL REFERENCES public.grupos_usuarios(id) ON DELETE CASCADE,
  UNIQUE(premio_id, grupo_id)
);

-- Create posts_feed table
CREATE TABLE IF NOT EXISTS public.posts_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  imagem_url TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create post_grupo table for associating posts with user groups
CREATE TABLE IF NOT EXISTS public.post_grupo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts_feed(id) ON DELETE CASCADE,
  grupo_id UUID NOT NULL REFERENCES public.grupos_usuarios(id) ON DELETE CASCADE,
  UNIQUE(post_id, grupo_id)
);

-- Create table for post reactions
CREATE TABLE IF NOT EXISTS public.reacoes_post (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts_feed(id) ON DELETE CASCADE,
  matricula TEXT NOT NULL REFERENCES public.matriculas_funcionarios(numero_matricula) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('like', 'dislike')),
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, matricula)
);

-- Create table for post comments
CREATE TABLE IF NOT EXISTS public.comentarios_post (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts_feed(id) ON DELETE CASCADE,
  matricula TEXT NOT NULL REFERENCES public.matriculas_funcionarios(numero_matricula) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for the premios table
ALTER TABLE public.premios ENABLE ROW LEVEL SECURITY;

-- Create policy for premios: anyone can view
CREATE POLICY "Anyone can view premios" 
ON public.premios 
FOR SELECT 
USING (true);

-- Create policy for premios: only admins can insert
CREATE POLICY "Only admins can insert premios" 
ON public.premios 
FOR INSERT 
WITH CHECK (current_setting('app.current_role', true)::text = 'admin');

-- Create policy for premios: only admins can update
CREATE POLICY "Only admins can update premios" 
ON public.premios 
FOR UPDATE 
USING (current_setting('app.current_role', true)::text = 'admin');

-- Create policy for premios: only admins can delete
CREATE POLICY "Only admins can delete premios" 
ON public.premios 
FOR DELETE 
USING (current_setting('app.current_role', true)::text = 'admin');

-- Add RLS policies for the posts_feed table
ALTER TABLE public.posts_feed ENABLE ROW LEVEL SECURITY;

-- Create policy for posts_feed: anyone can view
CREATE POLICY "Anyone can view posts_feed" 
ON public.posts_feed 
FOR SELECT 
USING (true);

-- Create policy for posts_feed: only admins can insert
CREATE POLICY "Only admins can insert posts_feed" 
ON public.posts_feed 
FOR INSERT 
WITH CHECK (current_setting('app.current_role', true)::text = 'admin');

-- Create policy for posts_feed: only admins can update
CREATE POLICY "Only admins can update posts_feed" 
ON public.posts_feed 
FOR UPDATE 
USING (current_setting('app.current_role', true)::text = 'admin');

-- Create policy for posts_feed: only admins can delete
CREATE POLICY "Only admins can delete posts_feed" 
ON public.posts_feed 
FOR DELETE 
USING (current_setting('app.current_role', true)::text = 'admin');

-- Add RLS policies for the reacoes_post table
ALTER TABLE public.reacoes_post ENABLE ROW LEVEL SECURITY;

-- Create policy for reacoes_post: anyone can view
CREATE POLICY "Anyone can view reacoes_post" 
ON public.reacoes_post 
FOR SELECT 
USING (true);

-- Create policy for reacoes_post: authenticated users can insert their own reactions
CREATE POLICY "Users can insert their own reactions" 
ON public.reacoes_post 
FOR INSERT 
WITH CHECK (matricula = current_setting('app.current_matricula', true)::text);

-- Create policy for reacoes_post: users can update their own reactions
CREATE POLICY "Users can update their own reactions" 
ON public.reacoes_post 
FOR UPDATE 
USING (matricula = current_setting('app.current_matricula', true)::text);

-- Create policy for reacoes_post: users can delete their own reactions
CREATE POLICY "Users can delete their own reactions" 
ON public.reacoes_post 
FOR DELETE 
USING (matricula = current_setting('app.current_matricula', true)::text);

-- Add RLS policies for the comentarios_post table
ALTER TABLE public.comentarios_post ENABLE ROW LEVEL SECURITY;

-- Create policy for comentarios_post: anyone can view
CREATE POLICY "Anyone can view comentarios_post" 
ON public.comentarios_post 
FOR SELECT 
USING (true);

-- Create policy for comentarios_post: authenticated users can insert their own comments
CREATE POLICY "Users can insert their own comments" 
ON public.comentarios_post 
FOR INSERT 
WITH CHECK (matricula = current_setting('app.current_matricula', true)::text);

-- Create policy for comentarios_post: users can update their own comments
CREATE POLICY "Users can update their own comments" 
ON public.comentarios_post 
FOR UPDATE 
USING (matricula = current_setting('app.current_matricula', true)::text);

-- Create policy for comentarios_post: users can delete their own comments
CREATE POLICY "Users can delete their own comments" 
ON public.comentarios_post 
FOR DELETE 
USING (matricula = current_setting('app.current_matricula', true)::text);

-- Set up Realtime for the new tables
ALTER TABLE public.posts_feed REPLICA IDENTITY FULL;
ALTER TABLE public.premios REPLICA IDENTITY FULL;
ALTER TABLE public.reacoes_post REPLICA IDENTITY FULL;
ALTER TABLE public.comentarios_post REPLICA IDENTITY FULL;

-- Update missoes table to validate tipo values using a check constraint
ALTER TABLE public.missoes DROP CONSTRAINT IF EXISTS missoes_tipo_check;
ALTER TABLE public.missoes ADD CONSTRAINT missoes_tipo_check 
  CHECK (tipo IN ('multipla_escolha', 'atividade', 'tarefa'));
