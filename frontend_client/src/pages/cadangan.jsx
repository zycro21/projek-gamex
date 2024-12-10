{
    /* Pop Up Detail Wishlist */
  }
  {
    showDetailWishlistPopUp && (
      <div className="wishlist-detail-popup-overlay">
        <div className="wishlist-detail-popup-content">
          <h2>Detail Wishlist</h2>
          {wishlistDetail && (
            <div className="wishlist-detail">
              <p>
                <strong>Wishlist Title:</strong> {wishlistDetail.title_wishlist}
              </p>
              <p>
                <strong>Created at:</strong> {wishlistDetail.created_at}
              </p>
            </div>
          )}
  
          {detailLoading ? (
            <p>Loading...</p>
          ) : (
            <>
              <div className="wishlist-game-cards-container">
                {wishlistGames((game) => (
                  <div className="wishlist-game-card" key={game.game_id}>
                    <img
                      src={game.image}
                      alt={game.title}
                      className="wishlist-game-image"
                    />
                    <h3>{game.title}</h3>
                    <p>Price: {game.price}</p>
                  </div>
                ))}
              </div>
  
              {/* Pagination Games */}
              <div className="wishlist-games-pagination">
                <button
                  onClick={() =>
                    handleGameWishhlistPageChange(gameDetailCurrentPage - 1)
                  }
                  disabled={gameDetailCurrentPage === 1}
                >
                  Previous
                </button>
                <span>
                  Page {gameDetailCurrentPage} of {gameDetailTotalPages}
                </span>
                <button
                  onClick={() =>
                    handleGameWishhlistPageChange(gameDetailCurrentPage + 1)
                  }
                  disabled={gameDetailCurrentPage === gameDetailTotalPages}
                >
                  Next
                </button>
              </div>
            </>
          )}
  
          {/* Tombol Close */}
          <button
            className="wishlist-detail-close-popup-button"
            onClick={() => setShowDetailWishlistPopUp(false)}
          >
            Close
          </button>
        </div>
      </div>
    );
  }
