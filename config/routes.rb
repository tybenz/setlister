Setlister::Application.routes.draw do
  devise_for :users

  resources :songs
  resources :setlist_songs

  get "groups/new" => "groups#new"
  resources :groups, :path => "/", :except => [:new, :index] do
    resources :songs
    resources :setlists do
      member do
        get :slideshow
      end
    end
  end

  root :to => 'home#index'
end
