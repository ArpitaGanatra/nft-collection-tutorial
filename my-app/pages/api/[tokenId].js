// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default function handler(req, res) {
  //BaseUri + tokenId
  //so we need which token id is being minted

  const tokenId = req.query.tokenId;
  const name = `Crypto Dev #${tokenId}`;
  const description = 'Crypto Dev is an nft collection for learn web3 developers';
  const image = `https://raw.githubusercontent.com/LearnWeb3DAO/NFT-Collection/main/my-app/public/cryptodevs/${Number(tokenId) - 1}.svg`;

  return res.json({
    name: name,
    description: description,
    image: image,
  })
}
